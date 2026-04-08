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
