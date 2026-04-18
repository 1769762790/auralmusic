export interface PendingTrackAudio {
  currentTime: number
  pause: () => void
  removeAttribute: (name: string) => void
  load: () => void
}
