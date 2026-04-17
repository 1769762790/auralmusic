import assert from 'node:assert/strict'
import test from 'node:test'

import { createMainWindowOptions } from '../src/main/window/main-window.ts'

test('createMainWindowOptions preserves current Windows window options', () => {
  const options = createMainWindowOptions({
    platform: 'win32',
    preloadPath: 'F:\\app\\out\\preload\\index.cjs',
  })

  assert.equal(options.width, 1280)
  assert.equal(options.height, 760)
  assert.equal(options.minWidth, 1280)
  assert.equal(options.minHeight, 760)
  assert.equal(options.frame, false)
  assert.equal(options.maximizable, false)
  assert.equal(options.titleBarStyle, undefined)
  assert.equal(options.titleBarOverlay, false)
  assert.equal(options.autoHideMenuBar, true)
  assert.deepEqual(options.webPreferences, {
    preload: 'F:\\app\\out\\preload\\index.cjs',
    contextIsolation: true,
    nodeIntegration: false,
    devTools: true,
  })
})

test('createMainWindowOptions preserves current macOS titlebar behavior', () => {
  const options = createMainWindowOptions({
    platform: 'darwin',
    preloadPath: '/app/out/preload/index.cjs',
  })

  assert.equal(options.frame, true)
  assert.equal(options.titleBarStyle, 'hiddenInset')
  assert.equal(options.titleBarOverlay, false)
})

test('createMainWindowOptions preserves current Linux titlebar behavior', () => {
  const options = createMainWindowOptions({
    platform: 'linux',
    preloadPath: '/app/out/preload/index.cjs',
  })

  assert.equal(options.frame, true)
  assert.equal(options.titleBarStyle, 'hidden')
  assert.equal(options.titleBarOverlay, true)
})
