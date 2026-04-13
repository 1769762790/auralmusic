import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveWindowCloseBehavior } from '../src/main/window/close-behavior.ts'

test('resolveWindowCloseBehavior allows closing when app is already quitting', () => {
  assert.equal(
    resolveWindowCloseBehavior({
      isQuitting: true,
      closeBehavior: 'ask',
    }),
    'allow-close'
  )
})

test('resolveWindowCloseBehavior maps configured close behavior when app is not quitting', () => {
  assert.equal(
    resolveWindowCloseBehavior({
      isQuitting: false,
      closeBehavior: 'ask',
    }),
    'request-confirmation'
  )

  assert.equal(
    resolveWindowCloseBehavior({
      isQuitting: false,
      closeBehavior: 'minimize',
    }),
    'hide-to-tray'
  )

  assert.equal(
    resolveWindowCloseBehavior({
      isQuitting: false,
      closeBehavior: 'quit',
    }),
    'allow-close'
  )
})
