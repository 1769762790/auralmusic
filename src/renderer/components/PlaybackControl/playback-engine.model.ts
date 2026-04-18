import type { PendingTrackAudio } from './types'

export function prepareAudioForPendingTrack(audio: PendingTrackAudio) {
  audio.pause()
  audio.removeAttribute('src')
  audio.currentTime = 0
  audio.load()
}
