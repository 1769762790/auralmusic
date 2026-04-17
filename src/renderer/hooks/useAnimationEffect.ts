import { useEffect } from 'react'
import { useConfigStore } from '@/stores/config-store'
import { applyAnimationEffectToRoot } from '@/theme/animation-effect'

export function useAnimationEffect() {
  const animationEffect = useConfigStore(state => state.config.animationEffect)
  const isLoading = useConfigStore(state => state.isLoading)

  useEffect(() => {
    if (isLoading) {
      return
    }

    applyAnimationEffectToRoot(document.documentElement, animationEffect)
  }, [animationEffect, isLoading])
}
