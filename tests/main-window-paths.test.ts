import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'

import {
  resolvePreloadPath,
  resolveRendererLoadTarget,
} from '../src/main/window/window-paths.ts'

test('resolveRendererLoadTarget uses packaged renderer html when app is packaged', () => {
  const mainDirname = path.join('F:', 'code-demo', 'AuralMusic', 'out', 'main')

  assert.deepEqual(
    resolveRendererLoadTarget({
      appIsPackaged: true,
      mainDirname,
      rendererUrl: 'http://localhost:5173',
    }),
    {
      type: 'file',
      value: path.join(mainDirname, '../renderer/index.html'),
    }
  )
})

test('resolveRendererLoadTarget uses development renderer url when app is not packaged', () => {
  assert.deepEqual(
    resolveRendererLoadTarget({
      appIsPackaged: false,
      mainDirname: 'ignored',
      rendererUrl: 'http://localhost:5173',
    }),
    {
      type: 'url',
      value: 'http://localhost:5173',
    }
  )
})

test('resolveRendererLoadTarget fails clearly when development renderer url is missing', () => {
  assert.throws(
    () =>
      resolveRendererLoadTarget({
        appIsPackaged: false,
        mainDirname: 'ignored',
        rendererUrl: '',
      }),
    /ELECTRON_RENDERER_URL/
  )
})

test('resolvePreloadPath points to the built preload cjs file', () => {
  const mainDirname = path.join('F:', 'code-demo', 'AuralMusic', 'out', 'main')

  assert.equal(
    resolvePreloadPath(mainDirname),
    path.join(mainDirname, '../preload/index.cjs')
  )
})
