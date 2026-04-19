import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createLxCurrentScriptInfo,
  createLxRuntimeMd5,
  createLxRuntimeBuffer,
  lxRuntimeBufferToString,
} from '../src/renderer/services/music-source/model/lx-runtime-utils.ts'

test('createLxRuntimeMd5 matches lx custom source md5 expectations', () => {
  assert.equal(createLxRuntimeMd5('hello'), '5d41402abc4b2a76b9719d911017c592')
  assert.equal(createLxRuntimeMd5('野花'), '28cf33c8fc8e9445047a960b23238258')
})

test('lx runtime buffer mirrors Buffer.from and bufToString for common encodings', () => {
  const utf8Buffer = createLxRuntimeBuffer('abc')
  assert.equal(lxRuntimeBufferToString(utf8Buffer), 'abc')
  assert.equal(lxRuntimeBufferToString(utf8Buffer, 'hex'), '616263')
  assert.equal(
    lxRuntimeBufferToString(createLxRuntimeBuffer('616263', 'hex')),
    'abc'
  )
  assert.equal(
    lxRuntimeBufferToString(createLxRuntimeBuffer('YQ==', 'base64')),
    'a'
  )
})

test('createLxCurrentScriptInfo exposes raw script to custom sources', () => {
  const script = '/** @name 野花 */\nconsole.log("source")'

  assert.deepEqual(
    createLxCurrentScriptInfo(
      {
        name: '野花',
        version: '1',
      },
      script
    ),
    {
      name: '野花',
      version: '1',
      rawScript: script,
    }
  )
})
