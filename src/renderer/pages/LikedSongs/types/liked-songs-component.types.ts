import type { LikedSongsPlaylistMeta } from './liked-songs-domain.types'

export interface LikedSongsHeroProps {
  totalSongs: number
}

export interface LikedSongsTrackPanelProps {
  playlist: LikedSongsPlaylistMeta
  refreshKey: string
}
