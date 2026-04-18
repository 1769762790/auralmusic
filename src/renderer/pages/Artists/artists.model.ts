import type {
  ArtistArea,
  ArtistFilterOption,
  ArtistInitial,
  ArtistType,
} from './types'

export const ARTIST_AREA_OPTIONS: ArtistFilterOption<ArtistArea>[] = [
  { label: '全部', value: -1 },
  { label: '华语', value: 7 },
  { label: '欧美', value: 96 },
  { label: '日本', value: 8 },
  { label: '韩国', value: 16 },
  { label: '其他', value: 0 },
]

export const ARTIST_TYPE_OPTIONS: ArtistFilterOption<ArtistType>[] = [
  { label: '全部', value: -1 },
  { label: '男歌手', value: 1 },
  { label: '女歌手', value: 2 },
  { label: '乐队组合', value: 3 },
]

export const ARTIST_INITIAL_OPTIONS: ArtistFilterOption<ArtistInitial>[] = [
  { label: '热门', value: -1 },
  ...Array.from({ length: 26 }, (_, index) => {
    const letter = String.fromCharCode(65 + index)
    return { label: letter, value: letter }
  }),
  { label: '#', value: 0 },
]
