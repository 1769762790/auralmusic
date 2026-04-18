import type { ReactNode } from 'react'

export type MediaDetailHeroType = 'playlist' | 'album'

export interface MediaDetailHeroProps {
  type: MediaDetailHeroType
  title: string
  coverUrl: string
  subtitle: string
  metaItems: string[]
  description?: string
  playDisabled?: boolean
  favoriteVisible?: boolean
  favorited?: boolean
  favoriteLoading?: boolean
  onPlay?: () => void
  onToggleFavorite?: () => void
  moreActions?: ReactNode
  isResize?: boolean
}
