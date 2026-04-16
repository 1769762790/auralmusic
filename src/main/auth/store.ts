import electron from 'electron'
import ElectronStore from 'electron-store'
import { AUTH_STORE_NAME } from './types.ts'
import { readMusicApiBaseUrlFromEnv } from '../music-api-runtime.ts'
import { resolveAppStoreDirectory } from '../storage/store-path.ts'
import { parseCookiePairs, type AuthSession } from '../../shared/auth.ts'
import { resolveAuthRequestHeaders } from './request-header.ts'

interface AuthStoreSchema {
  session: AuthSession | null
}

const Store =
  (
    ElectronStore as typeof ElectronStore & {
      default?: typeof ElectronStore
    }
  ).default ?? ElectronStore
const { session } = electron

const DEFAULT_AUTH_STATE: AuthStoreSchema = {
  session: null,
}

export function buildAuthStoreOptions(
  resolveStoreDirectory: () => string = resolveAppStoreDirectory
) {
  return {
    cwd: resolveStoreDirectory(),
    name: AUTH_STORE_NAME,
    defaults: DEFAULT_AUTH_STATE,
  }
}

function createAuthStore() {
  return new Store<AuthStoreSchema>(buildAuthStoreOptions())
}

class AuthStore {
  private static instance: ReturnType<typeof createAuthStore>

  private constructor() {}

  static getInstance(): ReturnType<typeof createAuthStore> {
    if (!AuthStore.instance) {
      AuthStore.instance = createAuthStore()
    }

    return AuthStore.instance
  }
}

let authRequestHookRegistered = false

function getAuthStore() {
  return AuthStore.getInstance()
}

function resolveAuthOrigin() {
  const baseURL = readMusicApiBaseUrlFromEnv()

  if (!baseURL) {
    return undefined
  }

  try {
    return new URL(baseURL).origin
  } catch (error) {
    console.error('Failed to resolve auth origin:', error)
    return undefined
  }
}

async function applyAuthCookies(authSession: AuthSession) {
  const origin = resolveAuthOrigin()
  if (!origin || !authSession.cookie) {
    return
  }

  const cookiePairs = parseCookiePairs(authSession.cookie)
  if (!cookiePairs.length) {
    return
  }

  await Promise.all(
    cookiePairs.map(pair =>
      session.defaultSession.cookies.set({
        url: origin,
        name: pair.name,
        value: pair.value,
        path: '/',
      })
    )
  )
}

async function clearAuthCookies(authSession?: AuthSession | null) {
  const origin = resolveAuthOrigin()
  if (!origin || !authSession?.cookie) {
    return
  }

  const cookiePairs = parseCookiePairs(authSession.cookie)
  if (!cookiePairs.length) {
    return
  }

  await Promise.all(
    cookiePairs.map(pair =>
      session.defaultSession.cookies.remove(origin, pair.name)
    )
  )
}

export function getAuthSession() {
  return getAuthStore().get('session')
}

export async function setAuthSession(authSession: AuthSession) {
  getAuthStore().set('session', authSession)
  await applyAuthCookies(authSession)
  return authSession
}

export async function clearAuthSession() {
  const currentSession = getAuthStore().get('session')
  await clearAuthCookies(currentSession)
  getAuthStore().set('session', null)
}

export async function bootstrapAuthSession() {
  const currentSession = getAuthStore().get('session')
  if (!currentSession) {
    return null
  }

  await applyAuthCookies(currentSession)
  return currentSession
}

export function registerAuthRequestHeaderHook() {
  if (authRequestHookRegistered) {
    return
  }

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({
      requestHeaders: resolveAuthRequestHeaders({
        authOrigin: resolveAuthOrigin(),
        authSession: getAuthSession(),
        requestHeaders: details.requestHeaders,
        requestUrl: details.url,
      }),
    })
  })

  authRequestHookRegistered = true
}
