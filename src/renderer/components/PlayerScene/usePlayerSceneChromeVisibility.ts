import { useCallback, useEffect, useRef, useState } from 'react'
import { resolvePlayerSceneChromeState } from './player-scene-chrome.model'
import type {
  PlayerSceneChromeEvent,
  PlayerSceneChromeState,
  UsePlayerSceneChromeVisibilityOptions,
} from './types'

const INITIAL_CHROME_STATE: PlayerSceneChromeState = {
  visible: true,
  hideDelayMs: null,
}

export function usePlayerSceneChromeVisibility({
  immersiveEnabled,
  isOpen,
}: UsePlayerSceneChromeVisibilityOptions) {
  const [chromeState, setChromeState] = useState(INITIAL_CHROME_STATE)
  const chromeStateRef = useRef(INITIAL_CHROME_STATE)
  const hideTimerRef = useRef<number | null>(null)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const commitChromeEvent = useCallback(
    (event: PlayerSceneChromeEvent) => {
      clearHideTimer()

      const nextState = resolvePlayerSceneChromeState(
        immersiveEnabled && isOpen,
        event,
        chromeStateRef.current
      )

      chromeStateRef.current = nextState
      setChromeState(nextState)

      if (nextState.hideDelayMs !== null) {
        hideTimerRef.current = window.setTimeout(() => {
          commitChromeEvent('hide-timeout')
        }, nextState.hideDelayMs)
      }
    },
    [clearHideTimer, immersiveEnabled, isOpen]
  )

  useEffect(() => {
    commitChromeEvent('scene-opened')

    return clearHideTimer
  }, [clearHideTimer, commitChromeEvent])

  const handleChromePointerActivity = useCallback(() => {
    commitChromeEvent('pointer-activity')
  }, [commitChromeEvent])

  return {
    chromeVisible: chromeState.visible,
    handleChromePointerActivity,
  }
}
