export interface DailySongRowItem {
  id: number
  name: string
  artistNames: string
  albumName: string
  coverUrl: string
  duration: number
}

export interface DailySongsPageState {
  songs: DailySongRowItem[]
}

export interface RawDailySongArtist {
  name?: string
}

export interface RawDailySongAlbum {
  name?: string
  picUrl?: string
}

export interface RawDailySong {
  id?: number
  name?: string
  dt?: number
  al?: RawDailySongAlbum
  ar?: RawDailySongArtist[]
}

export interface RawRecommendSongsResponse {
  dailySongs?: RawDailySong[]
  data?: {
    dailySongs?: RawDailySong[]
  }
}
