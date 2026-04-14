import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('router config declares downloads page route under app layout', () => {
  const file = readFileSync(
    new URL('../src/renderer/router/router.config.tsx', import.meta.url),
    'utf8'
  )

  assert.match(file, /path:\s*'\/downloads'/)
  assert.match(file, /meta:\s*\{\s*title:\s*'下载管理'/)
  assert.match(file, /element:\s*<Downloads\s*\/>/)
})
