import type {
  MvDetailHeroData,
  MvPlaybackData,
  SimilarMvItem,
} from '../../types'

export interface MvDetailHeaderProps {
  hero: MvDetailHeroData
}

export interface MvDetailPlayerProps {
  hero: MvDetailHeroData
  playback: MvPlaybackData | null
  loading?: boolean
}

export interface SimilarMvCardProps {
  item: SimilarMvItem
  onOpen: (id: number) => void
}

export interface SimilarMvSectionProps {
  items: SimilarMvItem[]
  loading?: boolean
  error?: string
  onOpen: (id: number) => void
}
