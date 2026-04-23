import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const appLayoutSource = readFileSync(
  new URL('../src/renderer/layout/AppLayout.tsx', import.meta.url),
  'utf8'
)

const settingsShortcutSource = readFileSync(
  new URL(
    '../src/renderer/pages/Settings/components/ShortcutKeySettings.tsx',
    import.meta.url
  ),
  'utf8'
)

const shortcutRegistrationBridgeSource = readFileSync(
  new URL(
    '../src/renderer/components/ShortcutRegistrationBridge/index.tsx',
    import.meta.url
  ),
  'utf8'
)

test('app layout mounts shortcut registration bridge globally', () => {
  assert.match(appLayoutSource, /ShortcutRegistrationBridge/)
  assert.match(appLayoutSource, /<ShortcutRegistrationBridge\s*\/>/)
})

test('shortcut settings no longer fetches global registration status on tab mount', () => {
  assert.doesNotMatch(settingsShortcutSource, /getGlobalRegistrationStatuses/)
  assert.doesNotMatch(
    settingsShortcutSource,
    /onGlobalRegistrationStatusesChanged/
  )
})

test('shortcut registration bridge uses debounce and cache to coalesce status sync', () => {
  assert.match(shortcutRegistrationBridgeSource, /setTimeout\(/)
  assert.match(shortcutRegistrationBridgeSource, /clearTimeout\(/)
  assert.match(
    shortcutRegistrationBridgeSource,
    /getGlobalRegistrationStatuses/
  )
  assert.match(shortcutRegistrationBridgeSource, /lastStatusesCacheKeyRef/)
})
