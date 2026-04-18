import type { DailySongRowItem } from '../../DailySongs/types'

export interface RawUserPlaylistItem {
  id?: number
  trackCount?: number
  coverImgUrl: string
}

export interface RawUserPlaylistResponse {
  data?: RawUserPlaylistResponse
  playlist?: RawUserPlaylistItem[]
}

export interface NormalizeLikedSongsTrackPageOptions {
  offset: number
  totalSongs: number
}

export interface LikedSongsPageState {
  totalSongs: number
  songs: DailySongRowItem[]
}

export interface LikedSongsPlaylistMeta {
  id: number
  totalSongs: number
  coverImgUrl: string
}

export interface LikedSongsTrackPage {
  list: DailySongRowItem[]
  hasMore: boolean
}
