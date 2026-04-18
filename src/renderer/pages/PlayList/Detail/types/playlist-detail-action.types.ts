export type PlaylistDetailMoreAction = 'edit' | 'delete'

export interface PlaylistUpdateDraft {
  id: number
  name: string
  description: string
}

export interface PlaylistUpdatePayload {
  id: number
  name: string
  desc: string
}
