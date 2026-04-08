import test from 'node:test'
import assert from 'node:assert/strict'

import {
  formatAlbumPublishDate,
  formatAlbumTrackDuration,
  normalizeAlbumDetailHero,
  normalizeAlbumTracks,
} from './src/renderer/pages/Albums/Detail/album-detail.model.ts'

test('normalizeAlbumDetailHero maps album payload into hero data', () => {
  const hero = normalizeAlbumDetailHero({
    album: {
      id: 7,
      name: 'album title',
      picUrl: 'https://img.example.com/album.jpg',
      publishTime: 1741392000000,
      description: 'album description',
      size: 12,
      artists: [{ name: 'Artist A' }, { name: 'Artist B' }],
    },
  })

  assert.deepEqual(hero, {
    id: 7,
    name: 'album title',
    coverUrl: 'https://img.example.com/album.jpg',
    artistNames: 'Artist A / Artist B',
    publishTime: 1741392000000,
    trackCount: 12,
    description: 'album description',
  })
})

test('normalizeAlbumTracks maps album songs into readonly rows', () => {
  const tracks = normalizeAlbumTracks({
    songs: [
      {
        id: 11,
        name: 'song name',
        dt: 258000,
        al: {
          name: 'album title',
          picUrl: 'https://img.example.com/song.jpg',
        },
        ar: [{ name: 'Artist A' }],
      },
    ],
  })

  assert.deepEqual(tracks, [
    {
      id: 11,
      name: 'song name',
      artistNames: 'Artist A',
      albumName: 'album title',
      duration: 258000,
      coverUrl: 'https://img.example.com/song.jpg',
    },
  ])
})

test('formatAlbumPublishDate formats timestamp as yyyy-mm-dd', () => {
  assert.equal(formatAlbumPublishDate(1741392000000), '2025-03-08')
})

test('formatAlbumTrackDuration formats milliseconds as mm:ss', () => {
  assert.equal(formatAlbumTrackDuration(258000), '04:18')
})
