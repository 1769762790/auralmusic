import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getMusicContextMenuDownloadHandler,
  shouldShowMusicContextMenuDownload,
} from '../src/renderer/components/MusicContextMenu/music-context-menu.model.ts'

test('getMusicContextMenuDownloadHandler returns the provided download callback', () => {
  const onDownload = () => undefined

  assert.equal(getMusicContextMenuDownloadHandler(onDownload), onDownload)
  assert.equal(getMusicContextMenuDownloadHandler(), undefined)
})

test('shouldShowMusicContextMenuDownload depends on whether a handler is provided', () => {
  assert.equal(shouldShowMusicContextMenuDownload(), false)
  assert.equal(
    shouldShowMusicContextMenuDownload(() => undefined),
    true
  )
})
