import request from '@/lib/request'
import type { UserCloudParams } from '@/types/api'

export function getUserCloud(params: UserCloudParams) {
  return request.get('/user/cloud', {
    params,
  })
}
