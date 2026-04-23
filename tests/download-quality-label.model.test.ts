import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildDownloadTaskViewModels,
  getDownloadTaskQualityLabel,
} from '../src/renderer/pages/Downloads/downloads.model.ts'

test('getDownloadTaskQualityLabel maps internal quality codes to Chinese labels', () => {
  assert.equal(getDownloadTaskQualityLabel('jymaster'), '超清母带')
  assert.equal(getDownloadTaskQualityLabel('dolby'), '杜比全景声')
  assert.equal(getDownloadTaskQualityLabel('lossless'), '无损')
  assert.equal(getDownloadTaskQualityLabel('higher'), '较高')
})

test('getDownloadTaskQualityLabel keeps compatibility with legacy quality values', () => {
  assert.equal(getDownloadTaskQualityLabel('flac'), '无损')
  assert.equal(getDownloadTaskQualityLabel('320k'), '较高')
  assert.equal(
    getDownloadTaskQualityLabel('unknown-quality'),
    'unknown-quality'
  )
  assert.equal(getDownloadTaskQualityLabel(''), '-')
})

test('buildDownloadTaskViewModels outputs localized quality labels for rows', () => {
  const rows = buildDownloadTaskViewModels([
    {
      taskId: '1',
      songName: 'song-1',
      status: 'completed',
      progress: 100,
      quality: 'jymaster',
    },
    {
      taskId: '2',
      songName: 'song-2',
      status: 'failed',
      progress: 27,
      quality: 'flac',
    },
  ])

  assert.equal(rows[0]?.qualityLabel, '超清母带')
  assert.equal(rows[1]?.qualityLabel, '无损')
})
