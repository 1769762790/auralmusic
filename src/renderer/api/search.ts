import request from '@/lib/request'

export function getCloudsearch() {
  return request.get('/cloudsearch?keywords=海阔天空&type=10')
}
