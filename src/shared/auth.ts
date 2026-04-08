export type AuthLoginMethod =
  | 'email'
  | 'phone-password'
  | 'phone-captcha'
  | 'qr'

export interface AuthUser {
  userId: number
  nickname: string
  avatarUrl: string
}

export interface AuthSession extends AuthUser {
  cookie: string
  loginMethod: AuthLoginMethod
  updatedAt: number
}

export interface CookiePair {
  name: string
  value: string
}

interface RawAuthProfile {
  nickname?: string
  avatarUrl?: string
  avatarImgUrl?: string
}

interface RawAuthAccount {
  id?: number
}

export interface RawAuthResponseBody {
  code?: number
  cookie?: string
  account?: RawAuthAccount
  profile?: RawAuthProfile
  data?: RawAuthResponseBody
}

const COOKIE_ATTRIBUTE_NAMES = new Set([
  'domain',
  'expires',
  'httponly',
  'max-age',
  'path',
  'priority',
  'secure',
  'samesite',
])

function unwrapResponseBody(
  response?: RawAuthResponseBody | null
): RawAuthResponseBody {
  if (!response) {
    return {}
  }

  if (response.data && typeof response.data === 'object') {
    return unwrapResponseBody(response.data)
  }

  return response
}

function isCookieAttribute(token: string) {
  const [name] = token.split('=')
  if (!name) {
    return true
  }

  return COOKIE_ATTRIBUTE_NAMES.has(name.trim().toLowerCase())
}

function toCookiePair(token: string): CookiePair | null {
  const index = token.indexOf('=')
  if (index <= 0) {
    return null
  }

  const name = token.slice(0, index).trim()
  const value = token.slice(index + 1).trim()

  if (!name || !value || isCookieAttribute(token)) {
    return null
  }

  return { name, value }
}

export function parseCookiePairs(cookieString = ''): CookiePair[] {
  return cookieString
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .flatMap(part => {
      const pair = toCookiePair(part)
      return pair ? [pair] : []
    })
}

function resolveCookieString(
  response: RawAuthResponseBody,
  fallbackCookie = ''
) {
  return (response.cookie || fallbackCookie || '').trim()
}

function resolveAvatarUrl(profile?: RawAuthProfile) {
  return profile?.avatarUrl?.trim() || profile?.avatarImgUrl?.trim() || ''
}

export function normalizeAuthSession(
  response?: RawAuthResponseBody | null,
  loginMethod: AuthLoginMethod = 'email',
  updatedAt = Date.now(),
  fallbackCookie = ''
): AuthSession {
  const body = unwrapResponseBody(response)
  const accountId = body.account?.id ?? 0
  const profile = body.profile

  return {
    cookie: resolveCookieString(body, fallbackCookie),
    loginMethod,
    updatedAt,
    userId: accountId,
    nickname: profile?.nickname?.trim() || '',
    avatarUrl: resolveAvatarUrl(profile),
  }
}
