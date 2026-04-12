import type { HomeDailySong, HomeFmSong, HomeNewSong } from './home.model'

export interface ArtistSummary {
  id: number
  name: string
  picUrl: string
}

export type DailySong = HomeDailySong

export type HomeFmData = HomeFmSong

export type NewSong = HomeNewSong

export interface AlbumSummary {
  id: number
  name: string
  picUrl: string
  artist: {
    name: string
  }
}
