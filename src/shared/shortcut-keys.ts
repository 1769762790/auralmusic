export const SHORTCUT_ACTIONS = [
  'playPause',
  'nextTrack',
  'previousTrack',
  'volumeUp',
  'volumeDown',
  'likeSong',
  'togglePlayer',
] as const

export type ShortcutActionId = (typeof SHORTCUT_ACTIONS)[number]

export type ShortcutScope = 'local' | 'global'

export interface ShortcutBinding {
  local: string
  global: string
}

export type ShortcutBindings = Record<ShortcutActionId, ShortcutBinding>

export const DEFAULT_SHORTCUT_BINDINGS: ShortcutBindings = {
  playPause: {
    local: 'Ctrl+P',
    global: 'Alt+Ctrl+P',
  },
  nextTrack: {
    local: 'Ctrl+ArrowRight',
    global: 'Alt+Ctrl+ArrowRight',
  },
  previousTrack: {
    local: 'Ctrl+ArrowLeft',
    global: 'Alt+Ctrl+ArrowLeft',
  },
  volumeUp: {
    local: 'Ctrl+ArrowUp',
    global: 'Alt+Ctrl+ArrowUp',
  },
  volumeDown: {
    local: 'Ctrl+ArrowDown',
    global: 'Alt+Ctrl+ArrowDown',
  },
  likeSong: {
    local: 'Ctrl+L',
    global: 'Alt+Ctrl+L',
  },
  togglePlayer: {
    local: 'Ctrl+M',
    global: 'Alt+Ctrl+M',
  },
}

export interface ShortcutKeyboardEventLike {
  key: string
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

const MODIFIER_KEYS = new Set(['Alt', 'Control', 'Ctrl', 'Meta', 'Shift'])

function isShortcutActionId(value: string): value is ShortcutActionId {
  return SHORTCUT_ACTIONS.includes(value as ShortcutActionId)
}

function normalizeMainKey(key: string): string | null {
  if (key === ' ') {
    return 'Space'
  }

  const trimmedKey = key.trim()

  if (!trimmedKey || MODIFIER_KEYS.has(trimmedKey)) {
    return null
  }

  if (trimmedKey === '+') {
    return 'Plus'
  }

  if (trimmedKey.length === 1) {
    return trimmedKey.toUpperCase()
  }

  return trimmedKey
}

function normalizeAccelerator(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const accelerator = value
    .split('+')
    .map(part => part.trim())
    .filter(Boolean)
    .join('+')

  return accelerator || null
}

export function normalizeShortcutBindings(value: unknown): ShortcutBindings {
  const persisted =
    value && typeof value === 'object'
      ? (value as Partial<Record<string, Partial<ShortcutBinding>>>)
      : {}

  return SHORTCUT_ACTIONS.reduce((bindings, actionId) => {
    const defaultBinding = DEFAULT_SHORTCUT_BINDINGS[actionId]
    const persistedBinding = isShortcutActionId(actionId)
      ? persisted[actionId]
      : undefined

    bindings[actionId] = {
      local:
        normalizeAccelerator(persistedBinding?.local) || defaultBinding.local,
      global:
        normalizeAccelerator(persistedBinding?.global) || defaultBinding.global,
    }

    return bindings
  }, {} as ShortcutBindings)
}

export function formatShortcutAccelerator(value: string): string {
  return value
    .split('+')
    .map(part => part.trim())
    .filter(Boolean)
    .join(' + ')
}

export function keyboardEventToShortcut(
  event: ShortcutKeyboardEventLike
): string | null {
  const mainKey = normalizeMainKey(event.key)

  if (!mainKey) {
    return null
  }

  const modifiers = [
    event.altKey ? 'Alt' : null,
    event.ctrlKey ? 'Ctrl' : null,
    event.metaKey ? 'Meta' : null,
    event.shiftKey ? 'Shift' : null,
  ].filter(Boolean)

  if (!modifiers.length) {
    return null
  }

  return [...modifiers, mainKey].join('+')
}

export function hasShortcutConflict(
  bindings: ShortcutBindings,
  scope: ShortcutScope,
  nextValue: string,
  actionId: ShortcutActionId
): boolean {
  const normalizedNextValue = normalizeAccelerator(nextValue)

  if (!normalizedNextValue) {
    return false
  }

  return SHORTCUT_ACTIONS.some(currentActionId => {
    if (currentActionId === actionId) {
      return false
    }

    return (
      normalizeAccelerator(bindings[currentActionId][scope]) ===
      normalizedNextValue
    )
  })
}
