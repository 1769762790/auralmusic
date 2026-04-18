import { normalizeAnimationEffect } from '../../main/config/types.ts'
import type { AnimationEffectRoot } from '@/types/core'

export const ANIMATION_EFFECT_ROOT_ATTRIBUTE = 'data-animation-effect'

export function applyAnimationEffectToRoot(
  root: AnimationEffectRoot,
  value: unknown
) {
  root.dataset.animationEffect = normalizeAnimationEffect(value)
}
