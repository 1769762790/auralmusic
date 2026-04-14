import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildLibraryQuickSongPlaybackQueue,
  filterLibraryQuickSongs,
} from '../src/renderer/pages/Library/components/library-quick-song-list.model.ts'

test('buildLibraryQuickSongPlaybackQueue maps library songs to playback tracks', () => {
  const queue = buildLibraryQuickSongPlaybackQueue([
    {
      id: 1,
      name: 'First Song',
      artistNames: 'Artist A',
      albumName: 'Album A',
      coverUrl: 'cover-a.jpg',
      duration: 120000,
    },
    {
      id: 2,
      name: 'Second Song',
      artistNames: 'Artist B',
      albumName: 'Album B',
      coverUrl: 'cover-b.jpg',
      duration: 180000,
    },
  ])

  assert.deepEqual(queue, [
    {
      id: 1,
      name: 'First Song',
      artistNames: 'Artist A',
      albumName: 'Album A',
      coverUrl: 'cover-a.jpg',
      duration: 120000,
    },
    {
      id: 2,
      name: 'Second Song',
      artistNames: 'Artist B',
      albumName: 'Album B',
      coverUrl: 'cover-b.jpg',
      duration: 180000,
    },
  ])
})

test('filterLibraryQuickSongs removes hidden ids and caps the quick list to nine items', () => {
  const songs = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    name: `Song ${index + 1}`,
    artistNames: `Artist ${index + 1}`,
    albumName: `Album ${index + 1}`,
    coverUrl: `cover-${index + 1}.jpg`,
    duration: 1000 * (index + 1),
  }))

  const filteredSongs = filterLibraryQuickSongs(songs, new Set([2, 5]))

  assert.equal(filteredSongs.length, 9)
  assert.deepEqual(
    filteredSongs.map(song => song.id),
    [1, 3, 4, 6, 7, 8, 9, 10, 11]
  )
})
