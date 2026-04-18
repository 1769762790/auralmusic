import request from '@/lib/request'
import { normalizeCollectPlaylistTargets } from '@/model'
import type { UserPlaylistParams } from '@/types/api'

/**
 * 鑾峰彇鐢ㄦ埛姝屽崟
 * 璇存槑 : 鐧诲綍鍚庤皟鐢ㄦ鎺ュ彛 , 浼犲叆鐢ㄦ埛 id, 鍙互鑾峰彇鐢ㄦ埛姝屽崟
 * - uid : 鐢ㄦ埛 id
 * - limit : 杩斿洖鏁伴噺 , 榛樿涓?30
 * - offset : 鍋忕Щ鏁伴噺锛岀敤浜庡垎椤?, 濡?:( 椤垫暟 -1)*30, 鍏朵腑 30 涓?limit 鐨勫€?, 榛樿涓?0
 * @param {Object} params
 * @param {number} params.uid
 * @param {number} params.limit
 * @param {number=} params.offset
 */
export function userPlaylist(params: UserPlaylistParams) {
  return request({
    url: '/user/playlist',
    method: 'get',
    params,
  })
}

export async function getCollectPlaylistTargets(params: UserPlaylistParams) {
  const response = await userPlaylist(params)
  return normalizeCollectPlaylistTargets(response.data)
}
