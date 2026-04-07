import request from '@/lib/request'

/**
 * 最新专辑
 * @returns
 */
export function getAlbumNewSet() {
  return request.get('/album/newest')
}
