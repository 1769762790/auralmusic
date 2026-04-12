export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export type PlaybackTrack = {
  id: number
  name: string
  artistNames: string
  albumName: string
  coverUrl: string
  duration: number
}

export type PlaybackQueueSnapshot = {
  queue: PlaybackTrack[]
  currentIndex: number
  currentTrack: PlaybackTrack | null
}

export type SongUrlV1Result = {
  id: number
  url: string
  time: number
  br: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function readSongUrlItems(payload: unknown): unknown[] {
  if (!isRecord(payload)) {
    return []
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  const nestedData = payload.data
  if (isRecord(nestedData) && Array.isArray(nestedData.data)) {
    return nestedData.data
  }

  return []
}

export function normalizeSongUrlV1Response(
  payload: unknown
): SongUrlV1Result | null {
  const item = readSongUrlItems(payload).find(candidate => {
    return isRecord(candidate) && typeof candidate.url === 'string'
  })

  if (!isRecord(item) || typeof item.url !== 'string' || !item.url.trim()) {
    return null
  }

  return {
    id: typeof item.id === 'number' ? item.id : 0,
    url: item.url,
    time: typeof item.time === 'number' ? item.time : 0,
    br: typeof item.br === 'number' ? item.br : 0,
  }
}

export function createSongUrlRequestAttempts(unblockEnabled: boolean) {
  return unblockEnabled ? [false, true] : [false]
}

export function normalizePlaybackVolume(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 70
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

export function normalizePlaybackTrack(track: unknown): PlaybackTrack | null {
  if (!isRecord(track)) {
    return null
  }

  const id = typeof track.id === 'number' ? track.id : 0
  const name = typeof track.name === 'string' ? track.name.trim() : ''

  if (!id || !name) {
    return null
  }

  return {
    id,
    name,
    artistNames:
      typeof track.artistNames === 'string' && track.artistNames.trim()
        ? track.artistNames.trim()
        : '未知歌手',
    albumName:
      typeof track.albumName === 'string' && track.albumName.trim()
        ? track.albumName.trim()
        : '未知专辑',
    coverUrl: typeof track.coverUrl === 'string' ? track.coverUrl : '',
    duration: typeof track.duration === 'number' ? track.duration : 0,
  }
}

export function createPlaybackQueueSnapshot(
  tracks: unknown[],
  startIndex: number
): PlaybackQueueSnapshot {
  const queue = tracks
    .map(track => normalizePlaybackTrack(track))
    .filter((track): track is PlaybackTrack => Boolean(track))

  if (!queue.length) {
    return {
      queue: [],
      currentIndex: -1,
      currentTrack: null,
    }
  }

  const currentIndex = Math.min(
    Math.max(Number.isFinite(startIndex) ? startIndex : 0, 0),
    queue.length - 1
  )

  return {
    queue,
    currentIndex,
    currentTrack: queue[currentIndex] || null,
  }
}

export function getNextQueueIndex(
  queue: PlaybackTrack[],
  currentIndex: number
) {
  const nextIndex = currentIndex + 1

  return nextIndex < queue.length ? nextIndex : null
}

export function getPreviousQueueIndex(
  queue: PlaybackTrack[],
  currentIndex: number
) {
  const previousIndex = currentIndex - 1

  return queue.length > 0 && previousIndex >= 0 ? previousIndex : null
}

export function getPlaybackQueueItemState(
  itemIndex: number,
  currentIndex: number,
  status: PlaybackStatus
) {
  const isActive = itemIndex === currentIndex

  return {
    isActive,
    isPlaying: isActive && (status === 'playing' || status === 'loading'),
  }
}
