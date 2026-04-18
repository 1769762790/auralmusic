import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const appLayoutSource = readFileSync(
  new URL('../src/renderer/layout/AppLayout.tsx', import.meta.url),
  'utf8'
)

test('app layout keeps heavy overlay modules behind lazy gates', () => {
  assert.doesNotMatch(
    appLayoutSource,
    /import\s+PlayerScene\s+from\s+['"]@\/components\/PlayerScene['"]/
  )
  assert.doesNotMatch(
    appLayoutSource,
    /import\s+CollectToPlaylistDrawer\s+from\s+['"]@\/components\/CollectToPlaylistDrawer['"]/
  )
  assert.match(
    appLayoutSource,
    /import\s+LazyPlayerScene\s+from\s+['"]@\/components\/PlayerScene\/LazyPlayerScene['"]/
  )
  assert.match(
    appLayoutSource,
    /import\s+LazyCollectToPlaylistDrawer\s+from\s+['"]@\/components\/CollectToPlaylistDrawer\/LazyCollectToPlaylistDrawer['"]/
  )
})
