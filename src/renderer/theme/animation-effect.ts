import { normalizeAnimationEffect } from '../../main/config/types.ts'

export const ANIMATION_EFFECT_ROOT_ATTRIBUTE = 'data-animation-effect'

interface AnimationEffectRoot {
  dataset: {
    animationEffect?: string
  }
}

export function applyAnimationEffectToRoot(
  root: AnimationEffectRoot,
  value: unknown
) {
  root.dataset.animationEffect = normalizeAnimationEffect(value)
}
