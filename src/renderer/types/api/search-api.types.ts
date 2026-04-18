import type { SearchType } from '@/components/SearchDialog/types'

export interface SearchResourcesParams {
  keywords: string
  type: SearchType
  limit?: number
  offset?: number
}
