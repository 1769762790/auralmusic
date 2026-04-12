export interface AlbumFilterOption<T> {
  label: string
  value: T
}

export type AlbumArea = 'ALL' | 'ZH' | 'EA' | 'KR' | 'JP'

export interface AlbumArtist {
  name: string
}

export interface AlbumListItem {
  id: number
  name: string
  picUrl: string
  blurPicUrl?: string
  artists?: AlbumArtist[]
  artist?: AlbumArtist
}

export interface NewAlbumsResponse {
  albums?: AlbumListItem[]
  total?: number
}

export const ALBUM_AREA_OPTIONS: AlbumFilterOption<AlbumArea>[] = [
  { label: '全部', value: 'ALL' },
  { label: '华语', value: 'ZH' },
  { label: '欧美', value: 'EA' },
  { label: '韩国', value: 'KR' },
  { label: '日本', value: 'JP' },
]
