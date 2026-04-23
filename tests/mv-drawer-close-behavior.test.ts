import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const mvDrawerSource = readFileSync(
  new URL('../src/renderer/components/MvDrawer/index.tsx', import.meta.url),
  'utf8'
)

test('mv drawer close handler only closes drawer and does not toggle window expansion', () => {
  const handleCloseMatch = mvDrawerSource.match(
    /const handleClose = \(\) => \{([\s\S]*?)\n  \}/
  )

  assert.ok(handleCloseMatch, 'expected handleClose function in MvDrawer')

  const handleCloseBody = handleCloseMatch[1] ?? ''

  assert.match(handleCloseBody, /closeDrawer\(\)/)
  assert.doesNotMatch(handleCloseBody, /toggleExpanded\(/)
})
