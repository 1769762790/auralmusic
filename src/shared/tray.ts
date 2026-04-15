import type { PlaybackMode, PlaybackStatus } from './playback.ts'

export type TrayState = {
  currentTrackName: string
  currentArtistNames: string
  status: PlaybackStatus
  playbackMode: PlaybackMode
  hasCurrentTrack: boolean
}

export type TrayCommand =
  | { type: 'toggle-play' }
  | { type: 'play-previous' }
  | { type: 'play-next' }
  | { type: 'set-playback-mode'; playbackMode: PlaybackMode }
  | { type: 'open-settings' }
