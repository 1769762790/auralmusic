import request from '@/lib/request'
import type {
  NewAlbumParams,
  SubscribedAlbumListParams,
  ToggleAlbumSubscriptionParams,
} from '@/types/api'

export function getAlbumNewSet() {
  return request.get('/album/newest')
}

export function getAlbumDetail(id: number | string) {
  return request.get('/album', {
    params: { id },
  })
}

export function getSubscribedAlbums(params: SubscribedAlbumListParams) {
  return request.get('/album/sublist', {
    params,
  })
}

export function getNewAlbums(params: NewAlbumParams) {
  return request.get('/album/new', {
    params,
  })
}

export function toggleAlbumSubscription(params: ToggleAlbumSubscriptionParams) {
  return request.get('/album/sub', {
    params,
  })
}

export const followAlbum = toggleAlbumSubscription
