import test from 'node:test'
import assert from 'node:assert/strict'

import {
  formatMvDuration,
  formatMvPublishDate,
  normalizeMvDetailHero,
  normalizeMvPlayback,
  normalizeSimilarMvs,
} from './src/renderer/pages/Mv/mv-detail.model.ts'

test('normalizeMvDetailHero maps mv payload into hero data', () => {
  const hero = normalizeMvDetailHero({
    data: {
      data: {
        id: 88,
        name: 'mv title',
        artistName: 'Singer A',
        cover: 'https://img.example.com/mv-cover.jpg',
        playCount: 987654,
        publishTime: 1741392000000,
        duration: 245000,
        desc: 'mv description',
        brs: [360, 720, 1080],
      },
    },
  })

  assert.deepEqual(hero, {
    id: 88,
    name: 'mv title',
    artistName: 'Singer A',
    coverUrl: 'https://img.example.com/mv-cover.jpg',
    playCount: 987654,
    publishTime: 1741392000000,
    duration: 245000,
    description: 'mv description',
    resolutions: [360, 720, 1080],
  })
})

test('normalizeMvPlayback extracts playable urls from mv url payload', () => {
  const playback = normalizeMvPlayback({
    data: {
      data: {
        url: 'https://cdn.example.com/mv.mp4',
        size: 12345678,
        br: 1080,
      },
    },
  })

  assert.deepEqual(playback, {
    url: 'https://cdn.example.com/mv.mp4',
    size: 12345678,
    quality: 1080,
  })
})

test('normalizeSimilarMvs maps similar mv payload into cards', () => {
  const mvs = normalizeSimilarMvs({
    mvs: [
      {
        id: 1,
        name: 'similar mv',
        artistName: 'Artist A',
        cover: 'https://img.example.com/similar.jpg',
        duration: 160000,
        playCount: 2400,
        publishTime: 1741392000000,
      },
    ],
  })

  assert.deepEqual(mvs, [
    {
      id: 1,
      name: 'similar mv',
      artistName: 'Artist A',
      coverUrl: 'https://img.example.com/similar.jpg',
      duration: 160000,
      playCount: 2400,
      publishTime: 1741392000000,
    },
  ])
})

test('formatMvPublishDate formats timestamp as yyyy-mm-dd', () => {
  assert.equal(formatMvPublishDate(1741392000000), '2025-03-08')
})

test('formatMvDuration formats milliseconds as mm:ss', () => {
  assert.equal(formatMvDuration(245000), '04:05')
})
