import request from '@/lib/request'

export function getAlbumNewSet() {
  return request.get('/album/newest')
}

export interface NewAlbumParams {
  area?: 'ALL' | 'ZH' | 'EA' | 'KR' | 'JP'
  limit?: number
  offset?: number
}

export function getNewAlbums(params: NewAlbumParams) {
  return request.get('/album/new', {
    params,
  })
}
