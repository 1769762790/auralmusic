import type { ReactNode } from 'react'

import type {
  PlaylistDetailHeroData,
  PlaylistTrackItem,
} from './playlist-detail-domain.types'
import type { PlaylistUpdatePayload } from '../playlist-detail-actions.model'

export interface PlaylistDetailHeroProps {
  hero: PlaylistDetailHeroData
  showFavoriteButton: boolean
  favoriteLoading: boolean
  onToggleFavorite: () => void
  onPlay: () => void
  moreActions?: ReactNode
}

export interface PlaylistDetailMoreActionsProps {
  playlistId: number
  playlistName: string
  playlistDescription: string
  isOwnPlaylist: boolean
  editSubmitting?: boolean
  deleteSubmitting?: boolean
  onEdit: (payload: PlaylistUpdatePayload) => Promise<void> | void
  onDelete: (playlistId: number) => Promise<void> | void
}

export interface PlaylistTrackTableProps {
  tracks: PlaylistTrackItem[]
}
