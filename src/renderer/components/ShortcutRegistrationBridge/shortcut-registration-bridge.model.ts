import type {
  GlobalShortcutRegistrationStatuses,
  ShortcutBindings,
} from '../../../shared/shortcut-keys.ts'
import { SHORTCUT_ACTIONS } from '../../../shared/shortcut-keys.ts'

export type ShortcutStatusFetchState = {
  latestRequestSeq: number
  appliedBindingsCacheKey: string
}

export type ShortcutStatusFetchRequest = {
  requestSeq: number
  bindingsCacheKey: string
  previousBindingsCacheKey: string
}

export function createStatusBindingsCacheKey(
  enabled: boolean,
  bindings: ShortcutBindings
) {
  return [
    enabled ? 'enabled' : 'disabled',
    ...SHORTCUT_ACTIONS.map(
      actionId => `${actionId}:${bindings[actionId].global}`
    ),
  ].join('|')
}

export function createStatusesCacheKey(
  statuses: GlobalShortcutRegistrationStatuses
) {
  return SHORTCUT_ACTIONS.map(actionId => {
    const status = statuses[actionId]
    const accelerator = status?.accelerator ?? 'null'
    const registeredFlag = status?.registered ? '1' : '0'
    return `${actionId}:${accelerator}:${registeredFlag}`
  }).join('|')
}

export function beginShortcutStatusFetch(
  state: ShortcutStatusFetchState,
  bindingsCacheKey: string
) {
  const requestSeq = state.latestRequestSeq + 1
  const request: ShortcutStatusFetchRequest = {
    requestSeq,
    bindingsCacheKey,
    previousBindingsCacheKey: state.appliedBindingsCacheKey,
  }

  return {
    request,
    state: {
      latestRequestSeq: requestSeq,
      appliedBindingsCacheKey: bindingsCacheKey,
    } satisfies ShortcutStatusFetchState,
  }
}

export function isShortcutStatusFetchRequestCurrent(
  state: ShortcutStatusFetchState,
  request: Pick<ShortcutStatusFetchRequest, 'requestSeq'>
) {
  return state.latestRequestSeq === request.requestSeq
}

export function rollbackShortcutStatusFetchOnFailure(
  state: ShortcutStatusFetchState,
  request: ShortcutStatusFetchRequest
): ShortcutStatusFetchState {
  if (!isShortcutStatusFetchRequestCurrent(state, request)) {
    return state
  }

  return {
    ...state,
    appliedBindingsCacheKey: request.previousBindingsCacheKey,
  }
}
