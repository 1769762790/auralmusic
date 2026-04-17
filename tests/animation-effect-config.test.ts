import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ANIMATION_EFFECT_LEVELS,
  defaultConfig,
  normalizeAnimationEffect,
} from '../src/main/config/types.ts'

test('animation effect defaults to standard motion', () => {
  assert.deepEqual(ANIMATION_EFFECT_LEVELS, ['standard', 'reduced', 'off'])
  assert.equal(defaultConfig.animationEffect, 'standard')
})

test('normalizeAnimationEffect preserves supported values and falls back for invalid values', () => {
  assert.equal(normalizeAnimationEffect('standard'), 'standard')
  assert.equal(normalizeAnimationEffect('reduced'), 'reduced')
  assert.equal(normalizeAnimationEffect('off'), 'off')
  assert.equal(normalizeAnimationEffect(undefined), 'standard')
  assert.equal(normalizeAnimationEffect('disabled'), 'standard')
})
