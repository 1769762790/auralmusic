import test from 'node:test'
import assert from 'node:assert/strict'

import type { PlaybackTrack } from '../src/shared/playback.ts'
import {
  formatLxInterval,
  selectBestLxSource,
  toLxMusicInfo,
} from '../src/renderer/services/music-source/lx-playback-resolver.ts'

const track: PlaybackTrack = {
  id: 1001,
  name: 'Example Song',
  artistNames: 'Artist A / Artist B',
  albumName: 'Example Album',
  coverUrl: 'https://image.test/cover.jpg',
  duration: 61000,
}

test('formatLxInterval renders mm:ss from milliseconds', () => {
  assert.equal(formatLxInterval(0), '00:00')
  assert.equal(formatLxInterval(61000), '01:01')
  assert.equal(formatLxInterval(3599000), '59:59')
})

test('toLxMusicInfo maps playback tracks into lx music info', () => {
  assert.deepEqual(toLxMusicInfo(track), {
    songmid: 1001,
    name: 'Example Song',
    singer: 'Artist A / Artist B',
    album: 'Example Album',
    source: 'wy',
    interval: '01:01',
    img: 'https://image.test/cover.jpg',
  })
})

test('selectBestLxSource prefers music info source before generic fallbacks', () => {
  assert.equal(
    selectBestLxSource(
      {
        mg: {
          name: 'Migu',
          type: 'music',
          actions: ['musicUrl'],
          qualitys: ['128k'],
        },
        wy: {
          name: 'NetEase',
          type: 'music',
          actions: ['musicUrl'],
          qualitys: ['320k'],
        },
      },
      ['wy', 'kw', 'kg', 'tx', 'mg']
    ),
    'wy'
  )

  assert.equal(
    selectBestLxSource({
      kg: {
        name: 'Kugou',
        type: 'music',
        actions: ['musicUrl'],
        qualitys: ['128k'],
      },
    }),
    'kg'
  )

  assert.equal(selectBestLxSource({}), null)
})

test('selectBestLxSource ignores sources that cannot resolve music urls', () => {
  assert.equal(
    selectBestLxSource({
      kw: {
        name: 'Kuwo',
        type: 'music',
        actions: ['lyric'],
        qualitys: ['320k'],
      },
      mg: {
        name: 'Migu',
        type: 'music',
        actions: ['musicUrl'],
        qualitys: ['320k'],
      },
    }),
    'mg'
  )
})
