export interface MvDetailParams {
  mvid: number | string
}

export interface MvPlaybackParams {
  id: number | string
  r?: number | string
}

export interface SimilarMvParams {
  mvid: number | string
}

export interface TopMvParams {
  limit?: number
  offset?: number
  area?: string
}

export interface SubscribedMvListParams {
  limit?: number
  offset?: number
}
