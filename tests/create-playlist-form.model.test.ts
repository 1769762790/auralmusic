import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildCreatePlaylistPayload,
  CREATE_PLAYLIST_TITLE_MAX_LENGTH,
} from '../src/renderer/model/create-playlist-form.model.ts'

test('buildCreatePlaylistPayload trims title and applies privacy flag', () => {
  assert.deepEqual(buildCreatePlaylistPayload('  通勤  ', true), {
    name: '通勤',
    privacy: '10',
  })

  assert.deepEqual(buildCreatePlaylistPayload('夜骑', false), {
    name: '夜骑',
    privacy: undefined,
  })
})

test('buildCreatePlaylistPayload rejects blank title and enforces max length', () => {
  assert.equal(buildCreatePlaylistPayload('   ', false), null)
  assert.equal(
    buildCreatePlaylistPayload(
      'a'.repeat(CREATE_PLAYLIST_TITLE_MAX_LENGTH + 1),
      false
    ),
    null
  )
})
