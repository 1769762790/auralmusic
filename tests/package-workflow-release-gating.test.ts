import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const packageWorkflow = readFileSync(
  new URL('../.github/workflows/package.yml', import.meta.url),
  'utf8'
)
const releaseItConfig = readFileSync(
  new URL('../.release-it.json', import.meta.url),
  'utf8'
)

test('package workflow gates latest release publication until all platform assets upload', () => {
  assert.match(packageWorkflow, /^\s*prepare-release:\s*$/m)
  assert.match(packageWorkflow, /^\s*finalize-release:\s*$/m)
  assert.match(packageWorkflow, /^\s*needs:\s*prepare-release\s*$/m)
  assert.ok(packageWorkflow.includes('--draft \\'))
  assert.ok(packageWorkflow.includes('--latest=false \\'))
  assert.ok(packageWorkflow.includes('--draft=false \\'))
  assert.ok(packageWorkflow.includes('--latest'))
})

test('release-it does not publish a public GitHub release before packaged assets exist', () => {
  assert.match(
    releaseItConfig,
    /"github"\s*:\s*\{\s*"release"\s*:\s*false\s*\}/m
  )
})
