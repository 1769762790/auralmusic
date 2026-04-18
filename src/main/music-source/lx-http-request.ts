import { Buffer } from 'node:buffer'
import type * as Electron from 'electron'

export type LxHttpRequestResponse = {
  statusCode: number
  headers: Record<string, string>
  body: unknown
}

type ElectronNet = typeof Electron.net

function parseLxHttpBody(rawBody: string) {
  try {
    return JSON.parse(rawBody) as unknown
  } catch {
    return rawBody
  }
}

function normalizeOutgoingHeaders(headers: RequestInit['headers']) {
  const result: Record<string, string | string[]> = {}

  if (!headers) {
    return result
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      result[key] = value
    }
    return result
  }

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string' || Array.isArray(value)) {
      result[key] = value
    }
  }

  return result
}

function normalizeIncomingHeaders(headers: Record<string, string | string[]>) {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(headers)) {
    result[key] = Array.isArray(value) ? value.join(', ') : value
  }

  return result
}

function toWritableRequestBody(body: RequestInit['body']) {
  if (body == null) {
    return null
  }

  if (typeof body === 'string') {
    return body
  }

  if (body instanceof URLSearchParams) {
    return body.toString()
  }

  if (body instanceof ArrayBuffer) {
    return Buffer.from(body)
  }

  if (ArrayBuffer.isView(body)) {
    return Buffer.from(body.buffer, body.byteOffset, body.byteLength)
  }

  throw new Error('Unsupported LX HTTP request body type')
}

export function createLxHttpRequestResponse(
  statusCode: number,
  headers: Record<string, string | string[]>,
  rawBody: string
): LxHttpRequestResponse {
  return {
    statusCode,
    headers: normalizeIncomingHeaders(headers),
    body: parseLxHttpBody(rawBody),
  }
}

export async function requestLxHttpWithElectronNet(
  net: ElectronNet,
  url: string,
  options: RequestInit = {}
): Promise<LxHttpRequestResponse> {
  return new Promise((resolve, reject) => {
    const request = net.request({
      url,
      method: options.method || 'GET',
      headers: normalizeOutgoingHeaders(options.headers),
      redirect: 'follow',
    })

    request.on('response', response => {
      const chunks: Buffer[] = []

      response.on('data', chunk => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })
      response.on('end', () => {
        resolve(
          createLxHttpRequestResponse(
            response.statusCode,
            response.headers,
            Buffer.concat(chunks).toString('utf8')
          )
        )
      })
      response.on('error', reject)
      response.on('aborted', () => {
        reject(new Error('LX HTTP response aborted'))
      })
    })
    request.on('error', reject)
    request.on('abort', () => {
      reject(new Error('LX HTTP request aborted'))
    })

    try {
      request.end(toWritableRequestBody(options.body) ?? undefined)
    } catch (error) {
      reject(error)
    }
  })
}
