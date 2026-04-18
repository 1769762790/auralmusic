import type { ReactNode } from 'react'

export interface PlaybackEngineRef {
  getAudioElement: () => HTMLAudioElement | null
}

export interface CurrentPlaybackSource {
  trackId: number
  sourceUrl: string
  loadedUrl: string
  cacheKey: string | null
}

export interface PlaybackControlTrack {
  name: string
  artistName: string
  coverUrl: string
}

export interface ControlButtonProps {
  label: string
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}
