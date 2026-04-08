import test from 'node:test'
import assert from 'node:assert/strict'

import {
  formatPlaylistUpdateDate,
  formatTrackDuration,
  normalizePlaylistDetailHero,
  normalizePlaylistTracks,
} from './src/renderer/pages/PlayList/Detail/playlist-detail.model.ts'

test('normalizePlaylistDetailHero maps playlist detail payload into hero data', () => {
  const hero = normalizePlaylistDetailHero({
    playlist: {
      id: 42,
      name: 'playlist title',
      coverImgUrl: 'https://img.example.com/cover.jpg',
      description: 'desc',
      updateTime: 1760000000000,
      trackCount: 50,
      creator: {
        nickname: 'Buradrrr',
      },
    },
  })

  assert.deepEqual(hero, {
    id: 42,
    name: 'playlist title',
    coverUrl: 'https://img.example.com/cover.jpg',
    creatorName: 'Buradrrr',
    description: 'desc',
    updateTime: 1760000000000,
    trackCount: 50,
  })
})

test('normalizePlaylistTracks maps songs into readonly track rows', () => {
  const tracks = normalizePlaylistTracks({
    songs: [
      {
        id: 1,
        name: "PIMMIE'S DILEMMA",
        dt: 118000,
        al: {
          name: 'Some Sexy Songs 4 U',
          picUrl: 'https://img.example.com/song.jpg',
        },
        ar: [{ name: 'Pimmle' }, { name: 'Drake' }],
      },
    ],
  })

  assert.deepEqual(tracks, [
    {
      id: 1,
      name: "PIMMIE'S DILEMMA",
      artistNames: 'Pimmle / Drake',
      albumName: 'Some Sexy Songs 4 U',
      duration: 118000,
      coverUrl: 'https://img.example.com/song.jpg',
    },
  ])
})

test('formatPlaylistUpdateDate formats timestamp as yyyy-mm-dd', () => {
  assert.equal(formatPlaylistUpdateDate(1741392000000), '2025-03-08')
})

test('formatTrackDuration formats milliseconds as mm:ss', () => {
  assert.equal(formatTrackDuration(118000), '01:58')
})
