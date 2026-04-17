import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const settingsSource = readFileSync(
  new URL('../src/renderer/pages/Settings/index.tsx', import.meta.url),
  'utf8'
)

test('settings page declares and mounts about tab', () => {
  assert.match(
    settingsSource,
    /import\s+AboutSettings\s+from\s+'\.\/components\/AboutSettings'/
  )
  assert.match(
    settingsSource,
    /\{\s*label:\s*'关于'\s*,\s*value:\s*'about'\s*\}/
  )
  assert.match(
    settingsSource,
    /<TabsContent\s+value='about'>\s*<AboutSettings\s*\/>\s*<\/TabsContent>/
  )
})
