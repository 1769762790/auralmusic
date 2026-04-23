import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const mvDrawerSource = readFileSync(
  new URL('../src/renderer/components/MvDrawer/index.tsx', import.meta.url),
  'utf8'
)

test('mv drawer defers teardown until close animation finishes to avoid flicker', () => {
  assert.match(mvDrawerSource, /const MV_DRAWER_CLOSE_TEARDOWN_DELAY_MS = \d+/)
  assert.match(mvDrawerSource, /if \(!open\) \{[\s\S]*setTimeout\(/)
  assert.match(mvDrawerSource, /resetDrawerState\(\)/)
})

test('mv drawer video key does not depend on transient store mvId during close', () => {
  assert.match(
    mvDrawerSource,
    /key=\{`\$\{state\.hero\?\.id \?\? 'mv'\}-\$\{videoUrl\}`\}/
  )
  assert.doesNotMatch(mvDrawerSource, /key=\{`\$\{mvId\}-\$\{videoUrl\}`\}/)
})
