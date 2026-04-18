import type { AlbumSummary, ArtistSummary, NewSong } from './home-domain.types'

export interface AlbumCardProps {
  id: number
  coverUrl?: string
  title?: string
  artist?: string
  onToAlbumDetail: (id: number) => void
}

export interface DailyFeatureCardProps {
  id: number
  isLoading?: boolean
  onPlay?: () => void
  coverUrl?: string
  onOpenDailySongs?: (id: number) => void
}

export interface FmFeatureCardProps {
  coverUrl?: string
  title?: string
  artist?: string
  isLoading?: boolean
  isActiveFm?: boolean
  isPlayingFm?: boolean
  actionLoading?: boolean
  disabled?: boolean
  onTogglePlay?: () => void
  moveToNext?: () => void
  trashCurrent?: () => void
}

export interface NewAlbumListProps {
  list?: AlbumSummary[]
  isLoading?: boolean
  onPlayAlbum?: (album: AlbumSummary) => void
}

export interface NewSongsListProps {
  list?: NewSong[]
  isLoading?: boolean
  onPlaySong?: (song: NewSong) => void
}

export interface SongItemProps {
  song: NewSong
  onPlay?: () => void
}

export interface ArtistCardProps {
  artist: ArtistSummary
  onToArtistDetail: (id: number) => void
}

export interface TopArtistsProps {
  list?: ArtistSummary[]
  isLoading?: boolean
}
