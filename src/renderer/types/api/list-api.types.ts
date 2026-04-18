import type { AudioQualityLevel } from '../../../../main/config/types.ts'

export interface CreatePlaylistParams {
  name: string
  privacy?: '10'
  type?: 'NORMAL' | 'VIDEO' | 'SHARED'
}

export interface DeletePlaylistParams {
  id: number | string
  timestamp?: number
}

export interface UpdatePlaylistParams {
  id: number | string
  name: string
  desc?: string
  tags?: string
  timestamp?: number
}

export interface UpdatePlaylistTracksParams {
  op: 'add' | 'del'
  pid: number | string
  tracks: Array<number | string> | number | string
  timestamp?: number
}

export interface AddSongToPlaylistParams {
  playlistId: number | string
  trackId: number | string
  isLikedPlaylist?: boolean
  userId?: number | string
  timestamp?: number
}

export interface TopPlaylistParams {
  order?: 'new' | 'hot'
  cat?: string
  limit?: number
  offset?: number
}

export interface PlaylistTracksParams {
  id: number | string
  limit?: number
  offset?: number
  timestamp?: number
}

export interface PlaylistSubscribeParams {
  id: number | string
  t: 1 | 2
}

export interface PersonalFmParams {
  timestamp?: number
}

export interface FmTrashParams {
  id: number | string
}

export interface LikeListParams {
  uid: number | string
  timestamp?: number
}

export interface ToggleSongLikeParams {
  id: number | string
  uid: number | string
  like: boolean
}

export interface SongUrlV1Params {
  id: number | string
  level: AudioQualityLevel
  unblock: boolean
}

export interface SongUrlMatchParams {
  id: number | string
  source: string
}

export interface SongDownloadUrlV1Params {
  id: number | string
  level: AudioQualityLevel
}

export interface LyricParams {
  id: number | string
}

export interface TopArtistsParams {
  limit?: number
  offset?: number
}

export interface PlaylistTrackAllSong {
  id?: number
}

export interface PlaylistTrackAllResponse {
  songs?: PlaylistTrackAllSong[]
}

export interface GetPlaylistSongIdsParams {
  id: number
  trackCount?: number
  timestamp?: number
}
