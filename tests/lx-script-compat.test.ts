import assert from 'node:assert/strict'
import test from 'node:test'

import { installLxScriptCompatGlobals } from '../src/renderer/services/music-source/model/lx-script-compat.ts'

test('installLxScriptCompatGlobals exposes babel regenerator globals for lx sources', () => {
  const scope = {} as Record<string, unknown>

  installLxScriptCompatGlobals(scope)

  assert.equal(typeof scope.asyncGeneratorStep, 'function')
  assert.equal(typeof scope._asyncToGenerator, 'function')
  assert.equal(typeof scope._regenerator, 'function')
  assert.equal(typeof scope._regeneratorDefine2, 'function')
  assert.equal(typeof scope._typeof, 'function')

  const regenerator = scope._regenerator as () => {
    m: <T>(generator: T) => T
    w: (
      inner: (...args: unknown[]) => unknown,
      marked: unknown
    ) => Iterator<unknown>
  }

  const _marked = regenerator().m(example)

  function example() {
    return regenerator().w(function (_context) {
      while (1)
        switch (_context.n) {
          case 0:
            _context.n = 1
            return 'hello'
          case 1:
            return _context.a(2, 'done')
        }
    }, _marked)
  }

  const iterator = example()
  assert.deepEqual(iterator.next(), { value: 'hello', done: false })
  assert.deepEqual(iterator.next(), { value: 'done', done: true })
})
