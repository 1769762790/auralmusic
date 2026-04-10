import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveAuthRequestHeaders } from '../src/main/auth/request-header.ts'
import type { AuthSession } from '../src/shared/auth.ts'

const authSession: AuthSession = {
  userId: 42,
  nickname: 'Aurora',
  avatarUrl: 'https://img.example.com/avatar.jpg',
  loginMethod: 'qr',
  updatedAt: 1744200000000,
  cookie: 'MUSIC_U=fresh-token; __remember_me=true; Path=/; HttpOnly',
}

test('resolveAuthRequestHeaders injects persisted auth cookies for music api requests', () => {
  const requestHeaders = resolveAuthRequestHeaders({
    authOrigin: 'http://127.0.0.1:7703',
    authSession,
    requestHeaders: {
      Cookie: 'NMTID=device-token',
    },
    requestUrl: 'http://127.0.0.1:7703/recommend/songs',
  })

  assert.equal(
    requestHeaders.Cookie,
    'NMTID=device-token; MUSIC_U=fresh-token; __remember_me=true'
  )
})

test('resolveAuthRequestHeaders keeps non-auth requests unchanged', () => {
  const requestHeaders = resolveAuthRequestHeaders({
    authOrigin: 'http://127.0.0.1:7703',
    authSession,
    requestHeaders: {
      Cookie: 'NMTID=device-token',
    },
    requestUrl: 'https://example.com/recommend/songs',
  })

  assert.deepEqual(requestHeaders, {
    Cookie: 'NMTID=device-token',
  })
})

test('resolveAuthRequestHeaders replaces stale auth cookie values with the persisted session', () => {
  const requestHeaders = resolveAuthRequestHeaders({
    authOrigin: 'http://127.0.0.1:7703',
    authSession,
    requestHeaders: {
      Cookie: 'MUSIC_U=stale-token; NMTID=device-token',
    },
    requestUrl: 'http://127.0.0.1:7703/personal_fm',
  })

  assert.equal(
    requestHeaders.Cookie,
    'MUSIC_U=fresh-token; NMTID=device-token; __remember_me=true'
  )
})
