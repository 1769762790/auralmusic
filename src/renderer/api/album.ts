import request from '@/lib/request'

export function getAlbumNewSet() {
  return request.get('/album/newest')
}

export function getAlbumDetail(id: number | string) {
  return request.get('/album', {
    params: { id },
  })
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
