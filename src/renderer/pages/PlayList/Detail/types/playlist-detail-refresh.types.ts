export interface PlaylistDetailLoadRequest {
  detail: {
    id: number
    timestamp?: number
  }
  tracks: {
    id: number
    limit: number
    offset: number
    timestamp?: number
  }
}
