import type {
  AlbumDetailHeroData,
  AlbumTrackItem,
} from './album-detail-domain.types'

export interface AlbumDetailHeroProps {
  hero: AlbumDetailHeroData
  isLiked: boolean
  likeLoading: boolean
  onToggleLiked: () => void
  onPlay: () => void
}

export interface AlbumTrackTableProps {
  tracks: AlbumTrackItem[]
}
