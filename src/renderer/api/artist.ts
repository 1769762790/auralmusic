import request from '@/lib/request'
import type {
  ArtistDetailParams,
  ArtistListPageParams,
  ArtistListParams,
  SubscribedArtistListParams,
  ToggleArtistSubscriptionParams,
} from '@/types/api'

export function getArtistList(params: ArtistListParams) {
  return request.get('/artist/list', {
    params,
  })
}

export function getSubscribedArtists(params: SubscribedArtistListParams) {
  return request.get('/artist/sublist', {
    params,
  })
}

export function getArtistDetail(params: ArtistDetailParams) {
  return request.get('/artist/detail', {
    params,
  })
}

export function getArtistTopSongs(params: ArtistDetailParams) {
  return request.get('/artist/top/song', {
    params,
  })
}

export function getArtistAlbums(params: ArtistListPageParams) {
  return request.get('/artist/album', {
    params,
  })
}

export function getArtistMvs(params: ArtistListPageParams) {
  return request.get('/artist/mv', {
    params,
  })
}

export function getSimilarArtists(params: ArtistDetailParams) {
  return request.get('/simi/artist', {
    params,
  })
}

export function getArtistDesc(params: ArtistDetailParams) {
  return request.get('/artist/desc', {
    params,
  })
}

/**
 * 鏀惰棌姝屾墜
 * 璇存槑 : 璋冪敤姝ゆ帴鍙?, 浼犲叆姝屾墜 id, 鍙敹钘忔瓕鎵?
 * - id: 姝屾墜 id
 * - t: 鎿嶄綔,1 涓烘敹钘?鍏朵粬涓哄彇娑堟敹钘?
 * @param {Object} params
 * @param {number} params.id
 * @param {number} params.t
 */
export function followArtist(params: ToggleArtistSubscriptionParams) {
  return request.get('/artist/sub', {
    params,
  })
}
