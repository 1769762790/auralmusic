import { Buffer } from 'node:buffer'
import { EventEmitter } from 'node:events'
import http from 'node:http'
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createLxHttpRequestResponse,
  requestLxHttpWithElectronNet,
  requestLxHttpWithNode,
} from '../src/main/music-source/lx-http-request.ts'

test('createLxHttpRequestResponse parses json bodies and flattens headers', () => {
  assert.deepEqual(
    createLxHttpRequestResponse(
      200,
      'OK',
      {
        'content-type': 'application/json',
        'set-cookie': ['a=1', 'b=2'],
      },
      JSON.stringify({ code: 0, url: 'https://cdn.test/a.mp3' })
    ),
    {
      statusCode: 200,
      statusMessage: 'OK',
      headers: {
        'content-type': 'application/json',
        'set-cookie': 'a=1, b=2',
      },
      bytes: 41,
      raw: Buffer.from(
        JSON.stringify({ code: 0, url: 'https://cdn.test/a.mp3' })
      ),
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
      'Bad Gateway',
      {
        'content-type': 'text/plain',
      },
      'plain body'
    ),
    {
      statusCode: 502,
      statusMessage: 'Bad Gateway',
      headers: {
        'content-type': 'text/plain',
      },
      bytes: 10,
      raw: Buffer.from('plain body'),
      body: 'plain body',
    }
  )
})

test('requestLxHttpWithElectronNet forwards method and custom headers through net.request', async () => {
  let capturedOptions: unknown = null
  let endedBody: string | Buffer | undefined

  class FakeResponse extends EventEmitter {
    statusCode = 200
    statusMessage = 'OK'
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
    statusMessage: 'OK',
    headers: {
      'content-type': 'application/json',
    },
    bytes: 47,
    raw: Buffer.from(
      JSON.stringify({ code: 0, url: 'https://cdn.test/from-lx.mp3' })
    ),
    body: {
      code: 0,
      url: 'https://cdn.test/from-lx.mp3',
    },
  })
})

test('requestLxHttpWithElectronNet encodes lx form requests', async () => {
  let capturedOptions: unknown = null
  let endedBody: string | Buffer | undefined

  class FakeResponse extends EventEmitter {
    statusCode = 200
    statusMessage = 'OK'
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
        response.emit('data', Buffer.from(JSON.stringify({ code: 0 })))
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

  await requestLxHttpWithElectronNet(
    fakeNet as never,
    'https://api.test/form',
    {
      method: 'POST',
      form: {
        id: 1,
        source: 'wy',
      },
    }
  )

  assert.deepEqual(capturedOptions, {
    url: 'https://api.test/form',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow',
  })
  assert.equal(endedBody, 'id=1&source=wy')
})

test('requestLxHttpWithNode returns a needle-like response from node http', async () => {
  const server = http.createServer((request, response) => {
    assert.equal(request.headers['x-request-key'], 'share-v2')

    response.writeHead(200, {
      'content-type': 'application/json',
      'x-source': 'node-http',
    })
    response.end(JSON.stringify({ code: 0, url: 'https://cdn.test/node.mp3' }))
  })

  await new Promise<void>(resolve => {
    server.listen(0, '127.0.0.1', resolve)
  })

  try {
    const address = server.address()
    assert.ok(address && typeof address === 'object')

    const result = await requestLxHttpWithNode(
      `http://127.0.0.1:${address.port}/url/wy/1/128k`,
      {
        method: 'GET',
        headers: {
          'X-Request-Key': 'share-v2',
        },
      }
    )

    assert.equal(result.statusCode, 200)
    assert.equal(result.statusMessage, 'OK')
    assert.equal(result.headers['x-source'], 'node-http')
    assert.equal(result.bytes, 44)
    assert.deepEqual(result.body, {
      code: 0,
      url: 'https://cdn.test/node.mp3',
    })
  } finally {
    server.close()
  }
})
