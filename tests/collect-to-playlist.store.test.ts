import test from 'node:test'
import assert from 'node:assert/strict'

import { useCollectToPlaylistStore } from '../src/renderer/stores/collect-to-playlist-store.ts'

test('collect-to-playlist store opens drawer with song context and resets on close', () => {
  useCollectToPlaylistStore.getState().closeDrawer()

  useCollectToPlaylistStore.getState().openDrawer({
    songId: 123,
    songName: '夜航',
    artistName: '群星',
    coverUrl: 'cover.jpg',
  })

  assert.equal(useCollectToPlaylistStore.getState().open, true)
  assert.deepEqual(useCollectToPlaylistStore.getState().song, {
    songId: 123,
    songName: '夜航',
    artistName: '群星',
    coverUrl: 'cover.jpg',
  })

  useCollectToPlaylistStore.getState().setOpen(false)

  assert.equal(useCollectToPlaylistStore.getState().open, false)
  assert.equal(useCollectToPlaylistStore.getState().song, null)
})
