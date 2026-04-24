import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildLocalLyricSearchKeyword,
  readFirstSearchSongCandidate,
  readOnlineCoverUrl,
  readOnlineLyricPayload,
} from '../src/main/local-library/local-library-online-lyric.model.ts'

test('buildLocalLyricSearchKeyword flattens artist separators for search requests', () => {
  assert.equal(
    buildLocalLyricSearchKeyword('七里香', '周杰伦|费玉清'),
    '七里香 周杰伦 费玉清'
  )
})

test('readFirstSearchSongCandidate returns the first valid song id', () => {
  assert.deepEqual(
    readFirstSearchSongCandidate({
      result: {
        songs: [{ id: 'x' }, { id: 12345 }],
      },
    }),
    { id: 12345 }
  )
})

test('readOnlineLyricPayload strips noisy json header lines from lyric text', () => {
  assert.deepEqual(
    readOnlineLyricPayload({
      lrc: {
        lyric: '{"t":0,"c":[]}\n[00:01.00]窗外的麻雀',
      },
      tlyric: {
        lyric: '[00:01.00]Outside the window',
      },
    }),
    {
      lyricText: '[00:01.00]窗外的麻雀',
      translatedLyricText: '[00:01.00]Outside the window',
    }
  )
})

test('readOnlineCoverUrl reads song detail album cover url', () => {
  assert.equal(
    readOnlineCoverUrl({
      songs: [
        {
          al: {
            picUrl: 'https://example.com/cover.jpg',
          },
        },
      ],
    }),
    'https://example.com/cover.jpg'
  )
})
