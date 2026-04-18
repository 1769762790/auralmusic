import request from '@/lib/request'
import type {
  MvDetailParams,
  MvPlaybackParams,
  SimilarMvParams,
  SubscribedMvListParams,
  TopMvParams,
} from '@/types/api'

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
