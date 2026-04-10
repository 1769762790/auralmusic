import request from '@/lib/request'

export interface UserCloudParams {
  limit?: number
  offset?: number
}

export function getUserCloud(params: UserCloudParams) {
  return request.get('/user/cloud', {
    params,
  })
}
