import test from 'node:test'
import assert from 'node:assert/strict'

import {
  defaultConfig,
  normalizeImmersivePlayerControls,
} from '../src/main/config/types.ts'

test('immersive player controls default to disabled', () => {
  assert.equal(defaultConfig.immersivePlayerControls, false)
})

test('normalizeImmersivePlayerControls preserves booleans and falls back for invalid values', () => {
  assert.equal(normalizeImmersivePlayerControls(true), true)
  assert.equal(normalizeImmersivePlayerControls(false), false)
  assert.equal(normalizeImmersivePlayerControls(undefined), false)
  assert.equal(normalizeImmersivePlayerControls('true'), false)
})
