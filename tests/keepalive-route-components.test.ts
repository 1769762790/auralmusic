import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const routeComponentsSource = readFileSync(
  new URL('../src/renderer/router/routeComponents.tsx', import.meta.url),
  'utf8'
)

const keepAliveRouteComponents = [
  ['Home', '@/pages/Home'],
  ['Albums', '@/pages/Albums'],
  ['Artists', '@/pages/Artists'],
  ['PlayList', '@/pages/PlayList'],
] as const

test('keep-alive route components are loaded synchronously', () => {
  for (const [componentName, importPath] of keepAliveRouteComponents) {
    assert.match(
      routeComponentsSource,
      new RegExp(`import\\s+${componentName}\\s+from\\s+['"]${importPath}['"]`)
    )
    assert.doesNotMatch(
      routeComponentsSource,
      new RegExp(`export\\s+const\\s+${componentName}\\s*=\\s*lazy\\s*\\(`)
    )
  }
})
