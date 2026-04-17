export const PLAYER_SCENE_CHROME_HIDE_DELAY_MS = 2000

export type PlayerSceneChromeEvent =
  | 'scene-opened'
  | 'pointer-activity'
  | 'hide-timeout'

export interface PlayerSceneChromeState {
  visible: boolean
  hideDelayMs: number | null
}

const VISIBLE_STATE: PlayerSceneChromeState = {
  visible: true,
  hideDelayMs: null,
}

export function resolvePlayerSceneChromeState(
  immersiveEnabled: boolean,
  event: PlayerSceneChromeEvent,
  previous: PlayerSceneChromeState = VISIBLE_STATE
): PlayerSceneChromeState {
  if (!immersiveEnabled) {
    return VISIBLE_STATE
  }

  if (event === 'hide-timeout') {
    return {
      visible: false,
      hideDelayMs: null,
    }
  }

  if (
    previous.visible &&
    previous.hideDelayMs === PLAYER_SCENE_CHROME_HIDE_DELAY_MS
  ) {
    return previous
  }

  return {
    visible: true,
    hideDelayMs: PLAYER_SCENE_CHROME_HIDE_DELAY_MS,
  }
}
