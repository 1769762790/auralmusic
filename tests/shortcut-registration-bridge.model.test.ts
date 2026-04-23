import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DEFAULT_SHORTCUT_BINDINGS,
  SHORTCUT_ACTIONS,
} from '../src/shared/shortcut-keys.ts'
import {
  beginShortcutStatusFetch,
  createStatusBindingsCacheKey,
  createStatusesCacheKey,
  isShortcutStatusFetchRequestCurrent,
  rollbackShortcutStatusFetchOnFailure,
  type ShortcutStatusFetchState,
} from '../src/renderer/components/ShortcutRegistrationBridge/shortcut-registration-bridge.model.ts'

function createStatuses(
  overrides: Partial<
    Record<
      (typeof SHORTCUT_ACTIONS)[number],
      {
        accelerator: string | null
        registered: boolean
      }
    >
  > = {}
) {
  return Object.fromEntries(
    SHORTCUT_ACTIONS.map(actionId => [
      actionId,
      overrides[actionId] ?? {
        accelerator: null,
        registered: false,
      },
    ])
  ) as Record<
    (typeof SHORTCUT_ACTIONS)[number],
    {
      accelerator: string | null
      registered: boolean
    }
  >
}

test('createStatusBindingsCacheKey changes when global shortcut bindings change', () => {
  const keyA = createStatusBindingsCacheKey(true, DEFAULT_SHORTCUT_BINDINGS)
  const keyB = createStatusBindingsCacheKey(false, DEFAULT_SHORTCUT_BINDINGS)

  assert.notEqual(keyA, keyB)
})

test('createStatusesCacheKey distinguishes accelerator differences', () => {
  const keyA = createStatusesCacheKey(
    createStatuses({
      playPause: {
        accelerator: 'Alt+Ctrl+P',
        registered: true,
      },
    })
  )
  const keyB = createStatusesCacheKey(
    createStatuses({
      playPause: {
        accelerator: 'Alt+Ctrl+K',
        registered: true,
      },
    })
  )

  assert.notEqual(keyA, keyB)
})

test('shortcut status fetch uses sequence to identify latest request', () => {
  const initialState: ShortcutStatusFetchState = {
    latestRequestSeq: 1,
    appliedBindingsCacheKey: 'prev',
  }

  const { request, state } = beginShortcutStatusFetch(initialState, 'next')

  assert.equal(state.latestRequestSeq, 2)
  assert.equal(state.appliedBindingsCacheKey, 'next')
  assert.equal(request.previousBindingsCacheKey, 'prev')
  assert.equal(isShortcutStatusFetchRequestCurrent(state, request), true)
  assert.equal(
    isShortcutStatusFetchRequestCurrent(state, { ...request, requestSeq: 1 }),
    false
  )
})

test('shortcut status fetch failure rolls back cache key only for the latest request', () => {
  const initialState: ShortcutStatusFetchState = {
    latestRequestSeq: 4,
    appliedBindingsCacheKey: 'before',
  }
  const { request, state } = beginShortcutStatusFetch(initialState, 'after')

  const rollbackState = rollbackShortcutStatusFetchOnFailure(state, request)
  assert.equal(rollbackState.appliedBindingsCacheKey, 'before')

  const staleRollbackState = rollbackShortcutStatusFetchOnFailure(
    {
      latestRequestSeq: state.latestRequestSeq + 1,
      appliedBindingsCacheKey: 'latest',
    },
    request
  )
  assert.equal(staleRollbackState.appliedBindingsCacheKey, 'latest')
})
