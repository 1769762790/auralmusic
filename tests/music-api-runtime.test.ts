import test from 'node:test'
import assert from 'node:assert/strict'

import { createMusicApiBaseUrl } from '../src/main/music-api-runtime.ts'
import { resolveRequestBaseUrl } from '../src/renderer/lib/request-base-url.ts'

test('createMusicApiBaseUrl builds the localhost url from the active port', () => {
  assert.equal(createMusicApiBaseUrl(7705), 'http://127.0.0.1:7705')
})

test('resolveRequestBaseUrl prefers the Electron runtime url over Vite env', () => {
  assert.equal(
    resolveRequestBaseUrl({
      runtimeBaseUrl: 'http://127.0.0.1:7705',
      viteApiBaseUrl: 'https://example.com/api',
    }),
    'http://127.0.0.1:7705'
  )
})

test('resolveRequestBaseUrl falls back to Vite env outside Electron', () => {
  assert.equal(
    resolveRequestBaseUrl({
      runtimeBaseUrl: undefined,
      viteApiBaseUrl: 'https://example.com/api',
    }),
    'https://example.com/api'
  )
})
