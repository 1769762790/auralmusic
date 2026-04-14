import assert from 'node:assert/strict'
import test from 'node:test'

import { createRuntimeApi } from '../src/preload/api/runtime-api.ts'
import { MUSIC_API_BASE_URL_ENV_KEY } from '../src/shared/music-api-runtime.ts'

test('createRuntimeApi reads the music api base url from the provided env bag', () => {
  const runtimeApi = createRuntimeApi({
    env: {
      [MUSIC_API_BASE_URL_ENV_KEY]: 'http://127.0.0.1:7705',
    },
    platform: 'win32',
  })

  assert.equal(runtimeApi.getMusicApiBaseUrl(), 'http://127.0.0.1:7705')
  assert.equal(runtimeApi.getPlatform(), 'win32')
})

test('createRuntimeApi trims empty env values to undefined', () => {
  const runtimeApi = createRuntimeApi({
    env: {
      [MUSIC_API_BASE_URL_ENV_KEY]: '   ',
    },
    platform: 'darwin',
  })

  assert.equal(runtimeApi.getMusicApiBaseUrl(), undefined)
  assert.equal(runtimeApi.getPlatform(), 'darwin')
})
