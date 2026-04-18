export interface MvDetailHeroData {
  id: number
  name: string
  artistName: string
  coverUrl: string
  playCount: number
  publishTime?: number
  duration: number
  description: string
  resolutions: number[]
}

export interface MvPlaybackData {
  url: string
  size?: number
  quality?: number
}

export interface SimilarMvItem {
  id: number
  name: string
  artistName: string
  coverUrl: string
  duration: number
  playCount: number
  publishTime?: number
}

export interface MvDetailPageState {
  hero: MvDetailHeroData | null
  playback: MvPlaybackData | null
  similarMvs: SimilarMvItem[]
}

export interface RawMvArtist {
  name?: string
}

export interface RawMvDetail {
  id?: number
  name?: string
  artistName?: string
  artists?: RawMvArtist[]
  cover?: string
  coverUrl?: string
  imgurl?: string
  imgurl16v9?: string
  playCount?: number
  publishTime?: number
  duration?: number
  desc?: string
  brs?: number[]
  videoGroup?: Array<{ id?: number; name?: string }>
}

export interface RawMvDetailResponse {
  data?: RawMvDetail | { data?: RawMvDetail }
}

export interface RawMvPlaybackItem {
  url?: string
  size?: number
  br?: number
}

export interface RawMvPlaybackResponse {
  data?:
    | RawMvPlaybackItem[]
    | { data?: RawMvPlaybackItem[] }
    | RawMvPlaybackItem
    | { data?: RawMvPlaybackItem }
}

export interface RawSimilarMv {
  id?: number
  name?: string
  artistName?: string
  artists?: RawMvArtist[]
  cover?: string
  coverUrl?: string
  imgurl?: string
  imgurl16v9?: string
  playCount?: number
  publishTime?: number
  duration?: number
}

export interface RawSimilarMvResponse {
  mvs?: RawSimilarMv[]
}
