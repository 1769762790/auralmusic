import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_SHORTCUT_BINDINGS,
  formatShortcutAccelerator,
  hasShortcutConflict,
  keyboardEventToShortcut,
  normalizeShortcutBindings,
} from './src/shared/shortcut-keys.ts'

test('default shortcut bindings include all supported actions', () => {
  assert.equal(Object.keys(DEFAULT_SHORTCUT_BINDINGS).length, 7)
  assert.deepEqual(DEFAULT_SHORTCUT_BINDINGS.playPause, {
    local: 'Ctrl+P',
    global: 'Alt+Ctrl+P',
  })
  assert.deepEqual(DEFAULT_SHORTCUT_BINDINGS.nextTrack, {
    local: 'Ctrl+ArrowRight',
    global: 'Alt+Ctrl+ArrowRight',
  })
})

test('normalizeShortcutBindings fills missing and invalid values with defaults', () => {
  assert.deepEqual(
    normalizeShortcutBindings({
      playPause: { local: 'Ctrl+Space', global: '' },
      nextTrack: null,
      unknownAction: { local: 'Ctrl+X', global: 'Alt+Ctrl+X' },
    }),
    {
      ...DEFAULT_SHORTCUT_BINDINGS,
      playPause: {
        local: 'Ctrl+Space',
        global: DEFAULT_SHORTCUT_BINDINGS.playPause.global,
      },
    }
  )
})

test('formatShortcutAccelerator renders accelerators with readable separators', () => {
  assert.equal(
    formatShortcutAccelerator('Ctrl+ArrowRight'),
    'Ctrl + ArrowRight'
  )
  assert.equal(formatShortcutAccelerator('Alt+Ctrl+P'), 'Alt + Ctrl + P')
})

test('keyboardEventToShortcut returns modifier plus main key accelerators', () => {
  assert.equal(
    keyboardEventToShortcut({
      key: 'ArrowRight',
      altKey: false,
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
    }),
    'Ctrl+ArrowRight'
  )
  assert.equal(
    keyboardEventToShortcut({
      key: 'p',
      altKey: true,
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
    }),
    'Alt+Ctrl+P'
  )
  assert.equal(
    keyboardEventToShortcut({
      key: ' ',
      altKey: false,
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
    }),
    'Ctrl+Space'
  )
})

test('keyboardEventToShortcut rejects modifier-only or main-key-only input', () => {
  assert.equal(
    keyboardEventToShortcut({
      key: 'Control',
      altKey: false,
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
    }),
    null
  )
  assert.equal(
    keyboardEventToShortcut({
      key: 'p',
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
    }),
    null
  )
})

test('hasShortcutConflict detects duplicate shortcuts in the same scope', () => {
  const bindings = normalizeShortcutBindings({
    playPause: { local: 'Ctrl+P', global: 'Alt+Ctrl+P' },
    nextTrack: { local: 'Ctrl+ArrowRight', global: 'Alt+Ctrl+ArrowRight' },
  })

  assert.equal(
    hasShortcutConflict(bindings, 'local', 'Ctrl+P', 'nextTrack'),
    true
  )
  assert.equal(
    hasShortcutConflict(bindings, 'global', 'Ctrl+P', 'nextTrack'),
    false
  )
  assert.equal(
    hasShortcutConflict(bindings, 'local', 'Ctrl+P', 'playPause'),
    false
  )
})
