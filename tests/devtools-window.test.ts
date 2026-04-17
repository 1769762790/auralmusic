import assert from 'node:assert/strict'
import test from 'node:test'

import { toggleDetachedDevTools } from '../src/main/window/devtools.ts'

test('toggleDetachedDevTools opens devtools in a detached window when closed', () => {
  const openCalls: unknown[] = []
  const webContents = {
    isDevToolsOpened: () => false,
    closeDevTools: () => {
      assert.fail('closeDevTools should not be called when devtools are closed')
    },
    openDevTools: (options: unknown) => {
      openCalls.push(options)
    },
  }

  toggleDetachedDevTools(webContents)

  assert.deepEqual(openCalls, [{ mode: 'detach', activate: true }])
})

test('toggleDetachedDevTools closes devtools when already opened', () => {
  let closeCalls = 0
  const webContents = {
    isDevToolsOpened: () => true,
    closeDevTools: () => {
      closeCalls += 1
    },
    openDevTools: () => {
      assert.fail('openDevTools should not be called when devtools are open')
    },
  }

  toggleDetachedDevTools(webContents)

  assert.equal(closeCalls, 1)
})
