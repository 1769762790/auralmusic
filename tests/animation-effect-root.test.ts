import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ANIMATION_EFFECT_ROOT_ATTRIBUTE,
  applyAnimationEffectToRoot,
} from '../src/renderer/theme/animation-effect.ts'

test('applyAnimationEffectToRoot writes a normalized root dataset value', () => {
  const root = {
    dataset: {} as DOMStringMap,
  }

  applyAnimationEffectToRoot(root, 'reduced')
  assert.equal(root.dataset.animationEffect, 'reduced')

  applyAnimationEffectToRoot(root, 'invalid')
  assert.equal(root.dataset.animationEffect, 'standard')
})

test('animation effect root attribute name matches the CSS selector contract', () => {
  assert.equal(ANIMATION_EFFECT_ROOT_ATTRIBUTE, 'data-animation-effect')
})
