export interface SubscribedAlbumListParams {
  limit?: number
  offset?: number
  timestamp?: number
}

export interface NewAlbumParams {
  area?: 'ALL' | 'ZH' | 'EA' | 'KR' | 'JP'
  limit?: number
  offset?: number
}

export interface ToggleAlbumSubscriptionParams {
  id: number
  t: 0 | 1
}
