import assert from 'node:assert/strict'
import test from 'node:test'

import { executeLxScript } from '../src/renderer/services/music-source/model/lx-script-executor.ts'

test('executeLxScript runs lx sources as classic scripts instead of strict ESM modules', () => {
  const scope = {
    __executed: false,
    lx: {
      value: 'from-lx',
    },
  } as Record<string, unknown>

  executeLxScript(
    `
      DEV_ENABLE = false;
      this.__executed = DEV_ENABLE === false && lx.value === 'from-lx';
    `,
    scope
  )

  assert.equal(scope.__executed, true)
})
