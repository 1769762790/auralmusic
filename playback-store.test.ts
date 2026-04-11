import test from 'node:test'
import assert from 'node:assert/strict'

import { usePlaybackStore } from './src/renderer/stores/playback-store.ts'
import type { PlaybackTrack } from './src/shared/playback.ts'

const tracks: PlaybackTrack[] = [
  {
    id: 1,
    name: 'Track 1',
    artistNames: 'Artist 1',
    albumName: 'Album 1',
    coverUrl: 'cover-1',
    duration: 180000,
  },
  {
    id: 2,
    name: 'Track 2',
    artistNames: 'Artist 2',
    albumName: 'Album 2',
    coverUrl: 'cover-2',
    duration: 200000,
  },
]

test('playQueueFromIndex sets queue and starts loading selected track', () => {
  usePlaybackStore.getState().resetPlayback()

  usePlaybackStore.getState().playQueueFromIndex(tracks, 1)

  const state = usePlaybackStore.getState()
  assert.equal(state.queue.length, 2)
  assert.equal(state.currentIndex, 1)
  assert.equal(state.currentTrack?.id, 2)
  assert.equal(state.status, 'loading')
  assert.equal(state.error, '')
  assert.equal(state.requestId, 1)
})

test('playNext and playPrevious respect queue boundaries', () => {
  usePlaybackStore.getState().resetPlayback()
  usePlaybackStore.getState().playQueueFromIndex(tracks, 0)

  assert.equal(usePlaybackStore.getState().playNext(), true)
  assert.equal(usePlaybackStore.getState().currentTrack?.id, 2)

  assert.equal(usePlaybackStore.getState().playNext(), false)
  assert.equal(usePlaybackStore.getState().status, 'paused')
  assert.equal(usePlaybackStore.getState().currentTrack?.id, 2)

  assert.equal(usePlaybackStore.getState().playPrevious(), true)
  assert.equal(usePlaybackStore.getState().currentTrack?.id, 1)

  assert.equal(usePlaybackStore.getState().playPrevious(), false)
  assert.equal(usePlaybackStore.getState().currentTrack?.id, 1)
})

test('markPlaybackError keeps queue and current track', () => {
  usePlaybackStore.getState().resetPlayback()
  usePlaybackStore.getState().playQueueFromIndex(tracks, 0)

  usePlaybackStore.getState().markPlaybackError('temporarily unavailable')

  const state = usePlaybackStore.getState()
  assert.equal(state.status, 'error')
  assert.equal(state.error, 'temporarily unavailable')
  assert.equal(state.queue.length, 2)
  assert.equal(state.currentTrack?.id, 1)
})

test('toggleMute restores the last audible volume', () => {
  usePlaybackStore.getState().resetPlayback()

  usePlaybackStore.getState().setVolume(35)
  usePlaybackStore.getState().toggleMute()

  assert.equal(usePlaybackStore.getState().volume, 0)

  usePlaybackStore.getState().toggleMute()

  assert.equal(usePlaybackStore.getState().volume, 35)
})
