import request from '../lib/request.ts'
import type {
  AddSongToPlaylistParams,
  CreatePlaylistParams,
  DeletePlaylistParams,
  FmTrashParams,
  GetPlaylistSongIdsParams,
  LikeListParams,
  LyricParams,
  PersonalFmParams,
  PlaylistSubscribeParams,
  PlaylistTrackAllResponse,
  PlaylistTracksParams,
  SongDownloadUrlV1Params,
  SongUrlMatchParams,
  SongUrlV1Params,
  TopArtistsParams,
  TopPlaylistParams,
  ToggleSongLikeParams,
  UpdatePlaylistParams,
  UpdatePlaylistTracksParams,
} from '@/types/api'

export function getTopList() {
  return request.get('/toplist')
}

export function getTopListDetailById(id: string) {
  return request.get(`/playlist/detail?id=${id}`)
}

export function getPlaylistDetail(id: number | string, timestamp?: number) {
  return request.get('/playlist/detail', {
    params: { id, timestamp },
  })
}

export function createPlaylist(params: CreatePlaylistParams) {
  return request.get('/playlist/create', {
    params,
  })
}

export function deletePlaylist(params: DeletePlaylistParams) {
  return request.get('/playlist/delete', {
    params,
  })
}

export function updatePlaylist(params: UpdatePlaylistParams) {
  return request.get('/playlist/update', {
    params,
  })
}

export function updatePlaylistTracks(params: UpdatePlaylistTracksParams) {
  const tracks = Array.isArray(params.tracks)
    ? params.tracks.join(',')
    : params.tracks

  return request.get('/playlist/tracks', {
    params: {
      op: params.op,
      pid: params.pid,
      tracks,
      timestamp: params.timestamp,
    },
  })
}

export function addSongToPlaylist(params: AddSongToPlaylistParams) {
  if (params.isLikedPlaylist) {
    if (!params.userId) {
      throw new Error('liked playlist add requires user id')
    }

    return toggleSongLike({
      id: params.trackId,
      uid: params.userId,
      like: true,
    })
  }

  return updatePlaylistTracks({
    op: 'add',
    pid: params.playlistId,
    tracks: params.trackId,
    timestamp: params.timestamp,
  })
}

export function getRecommendPlayList(limit: number = 1) {
  return request.get('/personalized', {
    params: { limit },
  })
}

export function geTopPlayList(params: TopPlaylistParams) {
  return request.get('/top/playlist', {
    params,
  })
}

export function getPlaylistTracks(params: PlaylistTracksParams) {
  return request.get('/playlist/track/all', {
    params,
  })
}

export function togglePlaylistSubscription(params: PlaylistSubscribeParams) {
  return request.get('/playlist/subscribe', {
    params,
  })
}

export function gePlayListCatList() {
  return request.get('/playlist/catlist')
}

export function getPersonalFm(params?: PersonalFmParams) {
  return request.get('/personal_fm', {
    params,
  })
}

export function fmTrash(params: FmTrashParams) {
  return request.get('/fm_trash', {
    params,
  })
}

export function getRecommendSongs() {
  return request.get('/recommend/songs')
}

export function getLikeList(params: LikeListParams) {
  return request.get('/likelist', {
    params,
  })
}

export function toggleSongLike(params: ToggleSongLikeParams) {
  return request.get('/song/like', {
    params,
  })
}

export function getSongUrlV1(params: SongUrlV1Params) {
  return request.get('/song/url/v1', {
    params,
  })
}

export function getSongUrlMatch(params: SongUrlMatchParams) {
  return request.get('/song/url/match', {
    params,
  })
}

export function getSongDownloadUrlV1(params: SongDownloadUrlV1Params) {
  return request.get('/song/download/url/v1', {
    params,
  })
}

export function getLyricNew(params: LyricParams) {
  return request.get('/lyric/new', {
    params,
  })
}

export function getSongDetail(ids: Array<number | string> | number | string) {
  const value = Array.isArray(ids) ? ids.join(',') : ids

  return request.get('/song/detail', {
    params: { ids: value },
  })
}

export function getTopArtists(params: TopArtistsParams) {
  return request.get('/top/artists', {
    params,
  })
}

export function getPersonalizedNewSong(limit?: number) {
  return request.get('/personalized/newsong', {
    params: {
      limit,
    },
  })
}

export function getPlaylistTrackAll(
  id: number,
  limit: number,
  offset: number,
  timestamp?: number
) {
  return request.get('/playlist/track/all', {
    params: {
      id,
      limit,
      offset,
      timestamp,
    },
  })
}

export async function getPlaylistSongIds(params: GetPlaylistSongIdsParams) {
  const limit = 1000
  const collectedIds: number[] = []
  const total = Math.max(params.trackCount || 0, 1)

  for (let offset = 0; offset < total; offset += limit) {
    const response = await getPlaylistTrackAll(
      params.id,
      limit,
      offset,
      params.timestamp
    )

    const songs =
      (response.data as PlaylistTrackAllResponse | undefined)?.songs || []
    const ids = songs
      .map(song => song.id)
      .filter((id): id is number => Number.isFinite(id))

    collectedIds.push(...ids)

    if (songs.length < limit) {
      break
    }
  }

  return collectedIds
}
