export interface ArtistFilterOption<T> {
  label: string
  value: T
}

export type ArtistArea = -1 | 7 | 96 | 8 | 16 | 0
export type ArtistType = -1 | 1 | 2 | 3
export type ArtistInitial = -1 | 0 | string

export interface ArtistListItem {
  id: number
  name: string
  picUrl: string
  alias?: string[]
  albumSize?: number
  musicSize?: number
}

export interface ArtistListResponse {
  artists: ArtistListItem[]
  more?: boolean
}
