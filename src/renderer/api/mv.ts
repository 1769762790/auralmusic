import request from '@/lib/request'

export interface MvDetailParams {
  mvid: number | string
}

export interface MvPlaybackParams {
  id: number | string
  r?: number | string
}

export interface SimilarMvParams {
  mvid: number | string
}

export interface TopMvParams {
  limit?: number
  offset?: number
  area?: string
}

export interface SubscribedMvListParams {
  limit?: number
  offset?: number
}

export function getMvDetail(params: MvDetailParams) {
  return request.get('/mv/detail', {
    params,
  })
}

export function getMvPlayback(params: MvPlaybackParams) {
  return request.get('/mv/url', {
    params,
  })
}

export function getSimilarMvs(params: SimilarMvParams) {
  return request.get('/simi/mv', {
    params,
  })
}

export function getTopMvs(params: TopMvParams = {}) {
  return request.get('/top/mv', {
    params: {
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
      area: params.area,
    },
  })
}

export function getSubscribedMvs(params: SubscribedMvListParams) {
  return request.get('/mv/sublist', {
    params,
  })
}
