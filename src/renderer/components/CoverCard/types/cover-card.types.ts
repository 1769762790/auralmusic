export interface CoverCardData {
  id?: number | string
  coverImgUrl?: string
  count?: number | string
  name?: string
}

export interface CoverCardProps {
  data?: CoverCardData
  isResize?: boolean
  onOpen?: (id: number | string) => void
  onPlay?: (id: number | string) => void
}
