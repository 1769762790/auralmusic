import type { PlaybackTrack } from '../../../../shared/playback.ts'

export type SearchType = 'song' | 'album' | 'artist' | 'playlist' | 'mv'

export interface SearchResultRowItem {
  id: number
  type: SearchType
  name: string
  artistName: string
  coverUrl: string
  targetId: number
  disabled: boolean
  playbackTrack: PlaybackTrack | null
}

export interface RawArtist {
  name?: string
}

export interface RawSongAlbum {
  name?: string
  picUrl?: string
}

export interface RawSongItem {
  id?: number
  name?: string
  fee?: number
  dt?: number
  ar?: RawArtist[]
  al?: RawSongAlbum
}

export interface RawAlbumItem {
  id?: number
  name?: string
  picUrl?: string
  artist?: RawArtist
  artists?: RawArtist[]
}

export interface RawSearchArtistItem {
  id?: number
  name?: string
  picUrl?: string
  img1v1Url?: string
  albumSize?: number
  mvSize?: number
}

export interface RawPlaylistItem {
  id?: number
  name?: string
  coverImgUrl?: string
  picUrl?: string
  creator?: {
    nickname?: string
  }
}

export interface RawMvItem {
  id?: number
  name?: string
  cover?: string
  coverUrl?: string
  imgurl16v9?: string
  artistName?: string
  artists?: RawArtist[]
}

export interface RawSearchResultPayload {
  result?: {
    songs?: RawSongItem[]
    albums?: RawAlbumItem[]
    artists?: RawSearchArtistItem[]
    playlists?: RawPlaylistItem[]
    mvs?: RawMvItem[]
  }
}

export interface SearchInputBarProps {
  value: string
  type: SearchType
  onValueChange: (value: string) => void
  onTypeChange: (value: SearchType) => void
}

export interface SearchResultListProps {
  query: string
  type: SearchType
  items: SearchResultRowItem[]
  loading: boolean
  hasMore: boolean
  error: string
  sentinelRef: (node: HTMLDivElement | null) => void
  onSelect: (item: SearchResultRowItem) => void
}

export interface SearchResultRowProps {
  item: SearchResultRowItem
  onSelect: (item: SearchResultRowItem) => void
}
