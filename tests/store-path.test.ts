import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveAppStoreDirectory } from '../src/main/storage/store-path.ts'

test('resolveAppStoreDirectory returns the Electron userData directory', () => {
  const directory = resolveAppStoreDirectory(name => {
    assert.equal(name, 'userData')
    return 'C:\\Users\\tester\\AppData\\Roaming\\AuralMusic'
  })

  assert.equal(directory, 'C:\\Users\\tester\\AppData\\Roaming\\AuralMusic')
})

test('resolveAppStoreDirectory throws when Electron userData is blank', () => {
  assert.throws(
    () => resolveAppStoreDirectory(() => '   '),
    /userData directory/i
  )
})
