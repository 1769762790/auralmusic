import type { AlbumArea, AlbumFilterOption } from './types'

export const ALBUM_AREA_OPTIONS: AlbumFilterOption<AlbumArea>[] = [
  { label: '全部', value: 'ALL' },
  { label: '华语', value: 'ZH' },
  { label: '欧美', value: 'EA' },
  { label: '韩国', value: 'KR' },
  { label: '日本', value: 'JP' },
]
