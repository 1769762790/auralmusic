import { create } from 'zustand'
import {
  createPlaybackQueueSnapshot,
  getNextQueueIndex,
  getPreviousQueueIndex,
  type PlaybackStatus,
  type PlaybackTrack,
} from '../../shared/playback.ts'

interface PlaybackStoreState {
  queue: PlaybackTrack[]
  currentIndex: number
  currentTrack: PlaybackTrack | null
  status: PlaybackStatus
  progress: number
  duration: number
  volume: number
  lastAudibleVolume: number
  error: string
  requestId: number
  seekRequestId: number
  seekPosition: number
  isPlayerSceneOpen: boolean
  isPlayerSceneFullscreen: boolean
  playQueueFromIndex: (tracks: PlaybackTrack[], startIndex: number) => void
  togglePlay: () => void
  playNext: () => boolean
  playPrevious: () => boolean
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  seekTo: (positionMs: number) => void
  setPlayerSceneOpen: (open: boolean) => void
  setPlayerSceneFullscreen: (fullscreen: boolean) => void
  openPlayerScene: () => void
  closePlayerScene: () => void
  markPlaybackLoading: () => void
  markPlaybackPlaying: () => void
  markPlaybackPaused: () => void
  markPlaybackError: (error: string) => void
  resetPlayback: () => void
}

const INITIAL_PLAYBACK_STATE = {
  queue: [],
  currentIndex: -1,
  currentTrack: null,
  status: 'idle' as PlaybackStatus,
  progress: 0,
  duration: 0,
  volume: 70,
  lastAudibleVolume: 70,
  error: '',
  requestId: 0,
  seekRequestId: 0,
  seekPosition: 0,
  isPlayerSceneOpen: false,
  isPlayerSceneFullscreen: false,
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, value))
}

function createTrackPatch(
  queue: PlaybackTrack[],
  currentIndex: number,
  requestId: number
) {
  const currentTrack = queue[currentIndex] || null

  return {
    currentIndex,
    currentTrack,
    status: currentTrack
      ? ('loading' as PlaybackStatus)
      : ('idle' as PlaybackStatus),
    progress: 0,
    duration: currentTrack?.duration || 0,
    error: '',
    requestId: currentTrack ? requestId + 1 : requestId,
  }
}

export const usePlaybackStore = create<PlaybackStoreState>((set, get) => ({
  ...INITIAL_PLAYBACK_STATE,

  playQueueFromIndex: (tracks, startIndex) => {
    const snapshot = createPlaybackQueueSnapshot(tracks, startIndex)
    set(state => ({
      ...snapshot,
      status: snapshot.currentTrack ? 'loading' : 'idle',
      progress: 0,
      duration: snapshot.currentTrack?.duration || 0,
      error: '',
      requestId: snapshot.currentTrack ? state.requestId + 1 : state.requestId,
    }))
  },

  togglePlay: () => {
    const state = get()

    if (!state.currentTrack) {
      return
    }

    if (state.status === 'playing' || state.status === 'loading') {
      set({ status: 'paused' })
      return
    }

    if (state.status === 'error') {
      set({
        status: 'loading',
        error: '',
        requestId: state.requestId + 1,
      })
      return
    }

    set({ status: 'playing', error: '' })
  },

  playNext: () => {
    const state = get()
    const nextIndex = getNextQueueIndex(state.queue, state.currentIndex)

    if (nextIndex === null) {
      set({ status: state.currentTrack ? 'paused' : 'idle' })
      return false
    }

    set(createTrackPatch(state.queue, nextIndex, state.requestId))
    return true
  },

  playPrevious: () => {
    const state = get()
    const previousIndex = getPreviousQueueIndex(state.queue, state.currentIndex)

    if (previousIndex === null) {
      return false
    }

    set(createTrackPatch(state.queue, previousIndex, state.requestId))
    return true
  },

  setProgress: progress => set({ progress: Math.max(0, progress) }),
  setDuration: duration => set({ duration: Math.max(0, duration) }),
  setVolume: volume => {
    const nextVolume = clampPercent(volume)

    set(state => ({
      volume: nextVolume,
      lastAudibleVolume:
        nextVolume > 0 ? nextVolume : state.lastAudibleVolume || 70,
    }))
  },
  toggleMute: () => {
    set(state => {
      if (state.volume > 0) {
        return {
          volume: 0,
          lastAudibleVolume: state.volume,
        }
      }

      return {
        volume: state.lastAudibleVolume || 70,
      }
    })
  },
  seekTo: positionMs => {
    const nextPosition = Math.max(
      0,
      Number.isFinite(positionMs) ? positionMs : 0
    )

    set(state => ({
      progress: nextPosition,
      seekPosition: nextPosition,
      seekRequestId: state.seekRequestId + 1,
    }))
  },
  setPlayerSceneOpen: open => set({ isPlayerSceneOpen: open }),
  setPlayerSceneFullscreen: fullscreen =>
    set({ isPlayerSceneFullscreen: fullscreen }),
  openPlayerScene: () => set({ isPlayerSceneOpen: true }),
  closePlayerScene: () => set({ isPlayerSceneOpen: false }),
  markPlaybackLoading: () => set({ status: 'loading', error: '' }),
  markPlaybackPlaying: () => set({ status: 'playing', error: '' }),
  markPlaybackPaused: () => set({ status: 'paused' }),
  markPlaybackError: error => set({ status: 'error', error }),
  resetPlayback: () => set(INITIAL_PLAYBACK_STATE),
}))
