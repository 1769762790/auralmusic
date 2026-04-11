import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createPlaybackQueueSnapshot,
  getNextQueueIndex,
  getPreviousQueueIndex,
  normalizeSongUrlV1Response,
  type PlaybackTrack,
} from './src/shared/playback.ts'

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

test('normalizeSongUrlV1Response reads the first playable url item', () => {
  assert.deepEqual(
    normalizeSongUrlV1Response({
      data: [
        {
          id: 1,
          url: 'https://music.example/1.mp3',
          time: 180000,
          br: 320000,
        },
      ],
    }),
    {
      id: 1,
      url: 'https://music.example/1.mp3',
      time: 180000,
      br: 320000,
    }
  )
})

test('normalizeSongUrlV1Response returns null when url is missing', () => {
  assert.equal(
    normalizeSongUrlV1Response({
      data: [{ id: 1, url: null, time: 180000, br: 320000 }],
    }),
    null
  )
  assert.equal(normalizeSongUrlV1Response({ data: [] }), null)
})

test('createPlaybackQueueSnapshot keeps a valid queue and selected index', () => {
  assert.deepEqual(createPlaybackQueueSnapshot(tracks, 1), {
    queue: tracks,
    currentIndex: 1,
    currentTrack: tracks[1],
  })
})

test('createPlaybackQueueSnapshot filters invalid tracks and clamps the index', () => {
  assert.deepEqual(
    createPlaybackQueueSnapshot(
      [tracks[0], { ...tracks[1], id: 0 }, { ...tracks[1], name: '' }],
      99
    ),
    {
      queue: [tracks[0]],
      currentIndex: 0,
      currentTrack: tracks[0],
    }
  )
})

test('queue index helpers respect playlist boundaries', () => {
  assert.equal(getNextQueueIndex(tracks, 0), 1)
  assert.equal(getNextQueueIndex(tracks, 1), null)
  assert.equal(getPreviousQueueIndex(tracks, 1), 0)
  assert.equal(getPreviousQueueIndex(tracks, 0), null)
})
