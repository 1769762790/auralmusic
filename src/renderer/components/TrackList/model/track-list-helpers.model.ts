import type { PlaybackTrack } from '../../../../shared/playback.ts'

import type { TrackListArtist, TrackListItemData } from '../types'

export function formatTrackListArtistNames(artists?: TrackListArtist[] | null) {
  if (!artists?.length) {
    return ''
  }

  return artists.map(artist => artist.name).join(' / ')
}

export function toPlaybackTrack(
  item: TrackListItemData,
  fallbackCoverUrl = ''
): PlaybackTrack {
  return {
    id: item.id,
    name: item.name,
    artistNames: item.artistNames || formatTrackListArtistNames(item.artists),
    albumName: item.albumName || '',
    coverUrl: item.coverUrl || fallbackCoverUrl,
    duration: item.duration,
  }
}
