import { Buffer } from 'node:buffer'
import { EventEmitter } from 'node:events'
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createLxHttpRequestResponse,
  requestLxHttpWithElectronNet,
} from '../src/main/music-source/lx-http-request.ts'

test('createLxHttpRequestResponse parses json bodies and flattens headers', () => {
  assert.deepEqual(
    createLxHttpRequestResponse(
      200,
      {
        'content-type': 'application/json',
        'set-cookie': ['a=1', 'b=2'],
      },
      JSON.stringify({ code: 0, url: 'https://cdn.test/a.mp3' })
    ),
    {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'set-cookie': 'a=1, b=2',
      },
      body: {
        code: 0,
        url: 'https://cdn.test/a.mp3',
      },
    }
  )
})

test('createLxHttpRequestResponse keeps non-json response text', () => {
  assert.deepEqual(
    createLxHttpRequestResponse(
      502,
      {
        'content-type': 'text/plain',
      },
      'plain body'
    ),
    {
      statusCode: 502,
      headers: {
        'content-type': 'text/plain',
      },
      body: 'plain body',
    }
  )
})

test('requestLxHttpWithElectronNet forwards method and custom headers through net.request', async () => {
  let capturedOptions: unknown = null
  let endedBody: string | Buffer | undefined

  class FakeResponse extends EventEmitter {
    statusCode = 200
    headers = {
      'content-type': 'application/json',
    }
  }

  class FakeRequest extends EventEmitter {
    end(body?: string | Buffer) {
      endedBody = body

      queueMicrotask(() => {
        const response = new FakeResponse()
        this.emit('response', response)
        response.emit(
          'data',
          Buffer.from(
            JSON.stringify({ code: 0, url: 'https://cdn.test/from-lx.mp3' })
          )
        )
        response.emit('end')
      })

      return this
    }
  }

  const fakeNet = {
    request: (options: unknown) => {
      capturedOptions = options
      return new FakeRequest()
    },
  }

  const result = await requestLxHttpWithElectronNet(
    fakeNet as never,
    'https://api.test/url/kw/1/128k',
    {
      method: 'GET',
      headers: {
        'X-Request-Key': 'share-v2',
        'User-Agent': 'lx-music-desktop/2.8.0',
      },
    }
  )

  assert.deepEqual(capturedOptions, {
    url: 'https://api.test/url/kw/1/128k',
    method: 'GET',
    headers: {
      'X-Request-Key': 'share-v2',
      'User-Agent': 'lx-music-desktop/2.8.0',
    },
    redirect: 'follow',
  })
  assert.equal(endedBody, undefined)
  assert.deepEqual(result, {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: {
      code: 0,
      url: 'https://cdn.test/from-lx.mp3',
    },
  })
})
