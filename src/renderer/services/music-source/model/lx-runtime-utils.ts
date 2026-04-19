import type { LxScriptInfo } from '../../../../shared/lx-music-source.ts'

type LxRuntimeBufferInput =
  | string
  | ArrayBuffer
  | ArrayBufferView
  | ArrayLike<number>

const MD5_SHIFT_AMOUNTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21,
]

const MD5_TABLE = Array.from({ length: 64 }, (_, index) =>
  Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000)
)

function toHexByte(value: number) {
  return value.toString(16).padStart(2, '0')
}

function toUint8Array(
  value: ArrayBuffer | ArrayBufferView | ArrayLike<number>
) {
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value)
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }

  return Uint8Array.from(Array.from(value, item => item & 0xff))
}

function decodeHex(value: string) {
  const normalized = value.trim()
  const bytes = new Uint8Array(Math.floor(normalized.length / 2))

  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(
      normalized.slice(index * 2, index * 2 + 2),
      16
    )
  }

  return bytes
}

function decodeBase64(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function encodeBase64(bytes: Uint8Array) {
  let binary = ''
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize))
  }

  return btoa(binary)
}

function rotateLeft(value: number, shift: number) {
  return (value << shift) | (value >>> (32 - shift))
}

function addUnsigned(...values: number[]) {
  return values.reduce((sum, value) => (sum + value) >>> 0, 0)
}

function md5Bytes(message: Uint8Array) {
  const bitLength = message.length * 8
  const paddedLength = (((message.length + 8) >> 6) + 1) * 64
  const padded = new Uint8Array(paddedLength)
  padded.set(message)
  padded[message.length] = 0x80

  for (let index = 0; index < 8; index++) {
    padded[paddedLength - 8 + index] =
      Math.floor(bitLength / 2 ** (8 * index)) & 0xff
  }

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = new Array<number>(16)

    for (let index = 0; index < 16; index++) {
      const wordOffset = offset + index * 4
      words[index] =
        padded[wordOffset] |
        (padded[wordOffset + 1] << 8) |
        (padded[wordOffset + 2] << 16) |
        (padded[wordOffset + 3] << 24)
    }

    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let index = 0; index < 64; index++) {
      let f: number
      let g: number

      if (index < 16) {
        f = (b & c) | (~b & d)
        g = index
      } else if (index < 32) {
        f = (d & b) | (~d & c)
        g = (5 * index + 1) % 16
      } else if (index < 48) {
        f = b ^ c ^ d
        g = (3 * index + 5) % 16
      } else {
        f = c ^ (b | ~d)
        g = (7 * index) % 16
      }

      const nextD = c
      c = b
      b = addUnsigned(
        b,
        rotateLeft(
          addUnsigned(a, f, MD5_TABLE[index], words[g]),
          MD5_SHIFT_AMOUNTS[index]
        )
      )
      a = d
      d = nextD
    }

    a0 = addUnsigned(a0, a)
    b0 = addUnsigned(b0, b)
    c0 = addUnsigned(c0, c)
    d0 = addUnsigned(d0, d)
  }

  const digest = new Uint8Array(16)
  ;[a0, b0, c0, d0].forEach((word, wordIndex) => {
    const offset = wordIndex * 4
    digest[offset] = word & 0xff
    digest[offset + 1] = (word >>> 8) & 0xff
    digest[offset + 2] = (word >>> 16) & 0xff
    digest[offset + 3] = (word >>> 24) & 0xff
  })

  return digest
}

export function createLxRuntimeBuffer(
  value: LxRuntimeBufferInput,
  encoding = 'utf8'
) {
  if (typeof value !== 'string') {
    return toUint8Array(value)
  }

  switch (encoding.toLowerCase()) {
    case 'hex':
      return decodeHex(value)
    case 'base64':
      return decodeBase64(value)
    case 'binary':
    case 'latin1':
      return Uint8Array.from(
        Array.from(value, char => char.charCodeAt(0) & 0xff)
      )
    default:
      return new TextEncoder().encode(value)
  }
}

export function lxRuntimeBufferToString(
  value: ArrayBuffer | ArrayBufferView | ArrayLike<number>,
  encoding = 'utf8'
) {
  const bytes = toUint8Array(value)

  switch (encoding.toLowerCase()) {
    case 'hex':
      return Array.from(bytes, toHexByte).join('')
    case 'base64':
      return encodeBase64(bytes)
    case 'binary':
    case 'latin1':
      return Array.from(bytes, byte => String.fromCharCode(byte)).join('')
    default:
      return new TextDecoder().decode(bytes)
  }
}

export function createLxRuntimeMd5(value: string | ArrayBufferView) {
  const bytes =
    typeof value === 'string'
      ? createLxRuntimeBuffer(value)
      : toUint8Array(value)

  return lxRuntimeBufferToString(md5Bytes(bytes), 'hex')
}

export function createLxCurrentScriptInfo(
  scriptInfo: LxScriptInfo,
  rawScript: string
) {
  return {
    ...scriptInfo,
    rawScript,
  }
}
