import test from 'node:test'
import assert from 'node:assert/strict'

import { usePlaybackQueueDrawerStore } from '../src/renderer/stores/playback-queue-drawer-store.ts'

test('playback queue drawer store exposes explicit and toggle actions', () => {
  usePlaybackQueueDrawerStore.setState({ open: false })

  usePlaybackQueueDrawerStore.getState().openDrawer()
  assert.equal(usePlaybackQueueDrawerStore.getState().open, true)

  usePlaybackQueueDrawerStore.getState().toggleDrawer()
  assert.equal(usePlaybackQueueDrawerStore.getState().open, false)

  usePlaybackQueueDrawerStore.getState().setOpen(true)
  assert.equal(usePlaybackQueueDrawerStore.getState().open, true)

  usePlaybackQueueDrawerStore.getState().closeDrawer()
  assert.equal(usePlaybackQueueDrawerStore.getState().open, false)
})
