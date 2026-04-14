import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getElectronWindowApi,
  isWindowsPlatform,
} from '../src/renderer/lib/electron-runtime.ts'

test('isWindowsPlatform falls back to false when preload runtime api is missing', () => {
  assert.equal(isWindowsPlatform({}), false)
})

test('getElectronWindowApi returns null when preload window api is missing', () => {
  assert.equal(getElectronWindowApi({}), null)
})

test('isWindowsPlatform detects win32 from the injected runtime api', () => {
  assert.equal(
    isWindowsPlatform({
      appRuntime: {
        getPlatform: () => 'win32',
      },
    }),
    true
  )
})
