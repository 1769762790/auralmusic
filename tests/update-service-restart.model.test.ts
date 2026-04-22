import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveQuitAndInstallOptions } from '../src/main/updater/update-service.model.ts'

test('resolveQuitAndInstallOptions uses silent install and relaunch on windows', () => {
  assert.deepEqual(resolveQuitAndInstallOptions('win32'), {
    isSilent: true,
    isForceRunAfter: true,
  })
})

test('resolveQuitAndInstallOptions keeps non-windows platforms non-silent', () => {
  assert.deepEqual(resolveQuitAndInstallOptions('darwin'), {
    isSilent: false,
    isForceRunAfter: true,
  })
  assert.deepEqual(resolveQuitAndInstallOptions('linux'), {
    isSilent: false,
    isForceRunAfter: true,
  })
})
