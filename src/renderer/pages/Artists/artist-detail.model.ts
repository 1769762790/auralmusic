export interface ArtistDetailProfile {
  id: number
  name: string
  coverUrl: string
  musicSize: number
  albumSize: number
  mvSize: number
  identity: string
}

export interface ArtistSongArtist {
  id?: number
  name: string
}

export interface ArtistTopSongItem {
  id: number
  name: string
  subtitle: string
  duration: number
  albumName: string
  coverUrl: string
  artists: ArtistSongArtist[]
}

export interface ArtistAlbumItem {
  id: number
  name: string
  picUrl: string
  publishTime?: number
  size?: number
}

export interface ArtistMvItem {
  id: number
  name: string
  coverUrl: string
  publishTime?: string
  playCount?: number
}

export interface ArtistDescSection {
  title: string
  content: string
}

export interface ArtistDescPayload {
  summary: string
  sections: ArtistDescSection[]
}

export interface ArtistLatestReleaseData {
  album: ArtistAlbumItem | null
  mv: ArtistMvItem | null
}

export interface ArtistDetailPageState {
  profile: ArtistDetailProfile | null
  topSongs: ArtistTopSongItem[]
  description: ArtistDescPayload
}

export function formatArtistDuration(duration: number) {
  const totalSeconds = Math.max(0, Math.floor(duration / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatArtistPublishDate(timestamp?: number | string) {
  if (!timestamp) return '暂无日期'

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '暂无日期'

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

export const EMPTY_ARTIST_DESCRIPTION: ArtistDescPayload = {
  summary: '',
  sections: [],
}
