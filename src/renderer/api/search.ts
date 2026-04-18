import request from '@/lib/request'

import { SEARCH_TYPE_CODE_MAP } from '@/components/SearchDialog/search-dialog.model'
import type { SearchResourcesParams } from '@/types/api'

export function searchResources({
  keywords,
  type,
  limit = 20,
  offset = 0,
}: SearchResourcesParams) {
  return request.get('/cloudsearch', {
    params: {
      keywords,
      type: SEARCH_TYPE_CODE_MAP[type],
      limit,
      offset,
    },
  })
}
