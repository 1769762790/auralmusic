import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const localLibraryPageSource = readFileSync(
  new URL('../src/renderer/pages/LocalLibrary/index.tsx', import.meta.url),
  'utf8'
)

test('local library page skips snapshot bootstrap when no roots are configured', () => {
  assert.match(
    localLibraryPageSource,
    /if\s*\(\s*configuredRoots\.length\s*===\s*0\s*\)\s*\{\s*setSnapshot\(EMPTY_LOCAL_LIBRARY_SNAPSHOT\)\s*setIsLoading\(false\)\s*return\s*\}/
  )
})
