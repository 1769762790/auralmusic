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

// 鑾峰彇鎺掕姒滃垪琛?
export function getTopList() {
  return request.get('/toplist')
}

// 鑾峰彇鎺掕姒滆鎯?
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

// 鑾峰彇鎺ㄨ崘姝屽崟
export function getRecommendPlayList(limit: number = 1) {
  return request.get('/personalized', {
    params: { limit },
  })
}

/**
 * 姝屽崟 ( 缃戝弸绮鹃€夌 )
 * 璇存槑 : 璋冪敤姝ゆ帴鍙?, 鍙幏鍙栫綉鍙嬬簿閫夌姝屽崟
 * - order: 鍙€夊€间负 'new' 鍜?'hot', 鍒嗗埆瀵瑰簲鏈€鏂板拰鏈€鐑?, 榛樿涓?'hot'
 * - cat: tag, 姣斿 " 鍗庤 "銆? 鍙ら " 銆? 娆х編 "銆? 娴佽 ", 榛樿涓?"鍏ㄩ儴",鍙粠姝屽崟鍒嗙被鎺ュ彛鑾峰彇(/playlist/catlist)
 * - limit: 鍙栧嚭姝屽崟鏁伴噺 , 榛樿涓?50
 * @param {object} params
 * @param {string} params.order
 * @param {string} params.cat
 * @param {number=} params.limit
 */
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

// 鑾峰彇鐑棬姝屽崟
export function gePlayListCatList() {
  return request.get('/playlist/catlist')
}

// 绉佷汉FM
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

//姣忔棩鎺ㄨ崘
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

// 鎸夋帴鍙ｆ枃妗ｄ娇鐢?/lyric/new锛岃繑鍥炲瓧娈典腑鐨?yrc 涓洪€愬瓧姝岃瘝銆?
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

/**
 * 鐑棬姝屾墜
 * @param {object} params
 * @param {number} params.limit
 * @param {number} params.offset
 * @returns
 */
export function getTopArtists(params: TopArtistsParams) {
  return request.get('/top/artists', {
    params,
  })
}

// 鑾峰彇鎺ㄨ崘鏂伴煶涔?
export function getPersonalizedNewSong(limit?: number) {
  return request.get('/personalized/newsong', {
    params: {
      limit,
    },
  })
}

/**
 *
 * @param id 姝屽崟 id
 * @param limit
 * @param offset
 * @returns
 */
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
