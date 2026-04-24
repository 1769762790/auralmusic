import { getLyricNew } from '@/api/list'
import { useConfigStore } from '@/stores/config-store'
import { parseLocalMediaUrl } from '../../../shared/local-media.ts'
import {
  createLyricCacheKey,
  hasLyricTextBundle,
  readLyricTextBundle,
} from './player-lyrics.data'
import {
  isLocalPlaybackTrack,
  resolveLocalPlaybackLyricTextBundle,
} from './player-lyrics-source.model'
import type { LyricTextBundle } from './types'
import type { PlaybackTrack } from '../../../shared/playback.ts'

const EMPTY_LYRIC_BUNDLE: LyricTextBundle = {
  lrc: '',
  tlyric: '',
  yrc: '',
}
const localLyricBundleCache = new Map<string, LyricTextBundle>()
const localLyricMissCache = new Set<string>()

async function readCachedLyricPayload(cacheKey: string) {
  try {
    const cachedPayload = await window.electronCache.readLyricsPayload(cacheKey)
    if (!cachedPayload) {
      return null
    }

    const parsedPayload = JSON.parse(cachedPayload)
    return hasLyricTextBundle(readLyricTextBundle(parsedPayload))
      ? parsedPayload
      : null
  } catch (error) {
    console.error('read lyric cache failed', error)
    return null
  }
}

function writeLyricPayload(cacheKey: string, payload: unknown) {
  void window.electronCache
    .writeLyricsPayload(cacheKey, payload)
    .catch(error => {
      console.error('write lyric cache failed', error)
    })
}

async function matchOnlineLocalLyricBundle(currentTrack: PlaybackTrack) {
  const filePath = parseLocalMediaUrl(currentTrack.sourceUrl ?? '')
  if (!filePath) {
    return EMPTY_LYRIC_BUNDLE
  }

  if (localLyricBundleCache.has(filePath)) {
    return localLyricBundleCache.get(filePath) ?? EMPTY_LYRIC_BUNDLE
  }

  if (
    localLyricMissCache.has(filePath) ||
    !useConfigStore.getState().config.localLibraryOnlineLyricMatchEnabled
  ) {
    return EMPTY_LYRIC_BUNDLE
  }

  try {
    const matchedLyrics = await window.electronLocalLibrary?.matchOnlineLyrics({
      filePath,
      title: currentTrack.name,
      artistName: currentTrack.artistNames,
      albumName: currentTrack.albumName,
      durationMs: currentTrack.duration,
      coverUrl: currentTrack.coverUrl,
    })

    if (!matchedLyrics?.lyricText && !matchedLyrics?.translatedLyricText) {
      localLyricMissCache.add(filePath)
      return EMPTY_LYRIC_BUNDLE
    }

    const nextBundle = {
      lrc: matchedLyrics.lyricText,
      tlyric: matchedLyrics.translatedLyricText,
      yrc: '',
    }
    localLyricBundleCache.set(filePath, nextBundle)
    return nextBundle
  } catch (error) {
    console.error('match local online lyrics failed', error)
    localLyricMissCache.add(filePath)
    return EMPTY_LYRIC_BUNDLE
  }
}

export async function fetchLyricTextBundle(
  trackId: number | string,
  currentTrack?: PlaybackTrack | null
): Promise<LyricTextBundle> {
  const localLyricBundle = resolveLocalPlaybackLyricTextBundle(currentTrack)
  if (localLyricBundle) {
    return localLyricBundle
  }

  if (currentTrack && isLocalPlaybackTrack(currentTrack)) {
    return matchOnlineLocalLyricBundle(currentTrack)
  }

  const cacheKey = createLyricCacheKey(trackId)
  const cachedPayload = await readCachedLyricPayload(cacheKey)
  if (cachedPayload) {
    return readLyricTextBundle(cachedPayload)
  }

  const response = await getLyricNew({ id: trackId })
  writeLyricPayload(cacheKey, response.data)
  return readLyricTextBundle(response.data)
}

export { resolveLocalPlaybackLyricTextBundle }
