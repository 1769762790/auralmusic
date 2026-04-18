import { normalizeLibrarySongs } from '../Library/model'
import type {
  LikedSongsPageState,
  LikedSongsPlaylistMeta,
  LikedSongsTrackPage,
  NormalizeLikedSongsTrackPageOptions,
  RawUserPlaylistResponse,
} from './types'

export const EMPTY_LIKED_SONGS_PAGE_STATE: LikedSongsPageState = {
  totalSongs: 0,
  songs: [],
}

function unwrapUserPlaylistResponse(
  response?: RawUserPlaylistResponse | null
): RawUserPlaylistResponse | undefined {
  if (!response) {
    return undefined
  }

  if (Array.isArray(response.playlist)) {
    return response
  }

  if (response.data && typeof response.data === 'object') {
    return unwrapUserPlaylistResponse(response.data)
  }

  return response
}

export function resolveLikedSongsPlaylist(
  response?: RawUserPlaylistResponse | null
): LikedSongsPlaylistMeta | null {
  const body = unwrapUserPlaylistResponse(response)
  const playlist = body?.playlist?.[0]

  if (!playlist?.id) {
    return null
  }

  return {
    id: playlist.id,
    coverImgUrl: playlist.coverImgUrl || '',
    totalSongs: playlist.trackCount || 0,
  }
}

export function normalizeLikedSongsTrackPage(
  response: unknown,
  { offset, totalSongs }: NormalizeLikedSongsTrackPageOptions
): LikedSongsTrackPage {
  const list = normalizeLibrarySongs(response)

  return {
    list,
    hasMore: offset + list.length < totalSongs,
  }
}
