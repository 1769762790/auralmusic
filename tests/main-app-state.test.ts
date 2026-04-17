import assert from 'node:assert/strict'
import test from 'node:test'

import { createMainAppState } from '../src/main/app/app-state.ts'

test('createMainAppState stores main window, quitting flag, and runtime', () => {
  const state = createMainAppState()
  const window = { id: 1 }
  const runtime = { dispose: () => undefined }

  assert.equal(state.getMainWindow(), null)
  assert.equal(state.getIsQuitting(), false)
  assert.equal(state.getMusicApiRuntime(), null)

  state.setMainWindow(window)
  state.setIsQuitting(true)
  state.setMusicApiRuntime(runtime)

  assert.equal(state.getMainWindow(), window)
  assert.equal(state.getIsQuitting(), true)
  assert.equal(state.getMusicApiRuntime(), runtime)

  state.clearMainWindow()
  state.clearMusicApiRuntime()

  assert.equal(state.getMainWindow(), null)
  assert.equal(state.getMusicApiRuntime(), null)
})
