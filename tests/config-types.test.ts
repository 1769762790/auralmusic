import assert from 'node:assert/strict'
import test from 'node:test'

import { defaultConfig } from '../src/main/config/types.ts'

test('defaultConfig does not seed deprecated music source providers', () => {
  assert.deepEqual(defaultConfig.musicSourceProviders, [])
})

test('defaultConfig seeds enhanced playback source modules in a stable order', () => {
  assert.deepEqual(defaultConfig.enhancedSourceModules, [
    'unm',
    'bikonoo',
    'gdmusic',
    'msls',
    'qijieya',
  ])
})
