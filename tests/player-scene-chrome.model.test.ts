import test from 'node:test'
import assert from 'node:assert/strict'

import {
  PLAYER_SCENE_CHROME_HIDE_DELAY_MS,
  resolvePlayerSceneChromeState,
} from '../src/renderer/components/PlayerScene/player-scene-chrome.model.ts'

test('player scene chrome uses a 2 second immersive hide delay', () => {
  assert.equal(PLAYER_SCENE_CHROME_HIDE_DELAY_MS, 2000)
})

test('resolvePlayerSceneChromeState keeps controls visible when immersive mode is disabled', () => {
  assert.deepEqual(
    resolvePlayerSceneChromeState(false, 'hide-timeout', {
      visible: false,
      hideDelayMs: null,
    }),
    {
      visible: true,
      hideDelayMs: null,
    }
  )
})

test('resolvePlayerSceneChromeState hides controls after immersive timeout', () => {
  assert.deepEqual(resolvePlayerSceneChromeState(true, 'scene-opened'), {
    visible: true,
    hideDelayMs: 2000,
  })

  assert.deepEqual(
    resolvePlayerSceneChromeState(true, 'hide-timeout', {
      visible: true,
      hideDelayMs: 2000,
    }),
    {
      visible: false,
      hideDelayMs: null,
    }
  )
})

test('resolvePlayerSceneChromeState reveals controls and reschedules hide on pointer activity', () => {
  assert.deepEqual(
    resolvePlayerSceneChromeState(true, 'pointer-activity', {
      visible: false,
      hideDelayMs: null,
    }),
    {
      visible: true,
      hideDelayMs: 2000,
    }
  )
})
