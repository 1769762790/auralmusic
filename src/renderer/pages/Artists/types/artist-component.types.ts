import type { ArtistFilterOption, ArtistListItem } from './artist-domain.types'

export interface ArtistCardProps {
  artist: ArtistListItem
}

export interface ArtistFilterGroupProps<T> {
  label: string
  options: ArtistFilterOption<T>[]
  value: T
  onChange: (value: T) => void
  compact?: boolean
}
