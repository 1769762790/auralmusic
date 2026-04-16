import assert from 'node:assert/strict'
import test from 'node:test'

import { AUTH_STORE_NAME } from '../src/main/auth/types.ts'
import { buildAuthStoreOptions } from '../src/main/auth/store.ts'
import { buildConfigStoreOptions } from '../src/main/config/store.ts'
import { buildDownloadStoreOptions } from '../src/main/download/store.ts'

const resolveStoreDirectory = () =>
  'C:\\Users\\tester\\AppData\\Roaming\\AuralMusic'

test('all persistent stores use the shared userData directory', () => {
  const authOptions = buildAuthStoreOptions(resolveStoreDirectory)
  const configOptions = buildConfigStoreOptions(resolveStoreDirectory)
  const downloadOptions = buildDownloadStoreOptions(resolveStoreDirectory)

  assert.equal(authOptions.cwd, resolveStoreDirectory())
  assert.equal(configOptions.cwd, resolveStoreDirectory())
  assert.equal(downloadOptions.cwd, resolveStoreDirectory())
})

test('store option builders preserve their existing identity and defaults', () => {
  const authOptions = buildAuthStoreOptions(resolveStoreDirectory)
  const configOptions = buildConfigStoreOptions(resolveStoreDirectory)
  const downloadOptions = buildDownloadStoreOptions(resolveStoreDirectory)

  assert.equal(authOptions.name, AUTH_STORE_NAME)
  assert.equal(configOptions.name, 'aural-music-config')
  assert.equal(downloadOptions.name, 'aural-music-downloads')
  assert.deepEqual(downloadOptions.defaults, { tasks: [] })
  assert.equal(configOptions.schema?.playbackVolume?.type, 'number')
})
