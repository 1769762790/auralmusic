import type {
  AlbumArea,
  AlbumFilterOption,
  AlbumListItem,
} from './album-domain.types'

export interface AlbumCardProps {
  album: AlbumListItem
  onToAlbumDetail: (id: number) => void
}

export interface AlbumFiltersProps {
  options: AlbumFilterOption<AlbumArea>[]
  value: AlbumArea
  onChange: (value: AlbumArea) => void
}
