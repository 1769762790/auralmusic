import { create } from 'zustand'
import {
  createLoginQr,
  getUserAccount,
  getVipInfoV2,
  logout as logoutRequest,
  loginWithEmail,
  loginWithPhone,
  checkLoginQr,
  getLoginQrKey,
  sendLoginCaptcha,
} from '@/api/auth'
import type { LoginMode } from '@/types/api'
import { normalizeAuthSession, normalizeVipState } from '../../shared/auth'
import type { AuthSession, AuthUser } from '../../shared/auth'
import type {
  AuthStoreState,
  LoginQrCheckResponse,
  LoginQrCreateResponse,
  LoginQrKeyResponse,
  QrState,
} from '@/types/core'
import { useUserStore } from './user'

const DEFAULT_LOGIN_MODE: LoginMode = 'qr'

const emptyUser = null

function unwrapNestedData<T>(response: T): T {
  let current: unknown = response

  while (
    current &&
    typeof current === 'object' &&
    'data' in current &&
    Boolean((current as { data?: unknown }).data)
  ) {
    current = (current as { data?: unknown }).data
  }

  return current as T
}

function toUser(session: AuthSession): AuthUser {
  return {
    userId: session.userId,
    nickname: session.nickname,
    avatarUrl: session.avatarUrl,
  }
}

async function persistSession(session: AuthSession) {
  await window.electronAuth.setAuthSession(session)
}

async function clearPersistedSession() {
  await window.electronAuth.clearAuthSession()
}

let qrState: QrState = {
  key: '',
  qrImg: '',
  qrUrl: '',
  polling: false,
}

let qrPollGeneration = 0

async function requestAuthSession(
  mode: LoginMode,
  response: unknown,
  fallbackCookie = ''
) {
  const updatedAt = Date.now()
  const session = normalizeAuthSession(
    response as Parameters<typeof normalizeAuthSession>[0],
    mode,
    updatedAt,
    fallbackCookie
  )

  if (!session.cookie || !session.userId) {
    throw new Error('auth session is incomplete')
  }

  // 会员态只影响音源分流，接口失败时按非 VIP 兜底，避免登录流程被次要能力阻断。
  const vipState = await getVipInfoV2(session.cookie, session.userId)
    .then(payload => normalizeVipState(payload, updatedAt))
    .catch(error => {
      console.error('fetch vip info failed', error)
      return normalizeVipState(null, updatedAt)
    })

  const nextSession = {
    ...session,
    ...vipState,
  }

  await persistSession(nextSession)
  return nextSession
}

export const useAuthStore = create<AuthStoreState>(set => ({
  user: emptyUser,
  session: null,
  isLoading: false,
  dialogOpen: false,
  loginMode: DEFAULT_LOGIN_MODE,
  loginStatus: 'anonymous',
  errorMessage: null,
  hasHydrated: false,

  hydrateAuth: async () => {
    set({ isLoading: true, errorMessage: null })

    try {
      const persistedSession = await window.electronAuth.getAuthSession()
      if (!persistedSession?.cookie) {
        set({
          user: null,
          session: null,
          loginStatus: 'anonymous',
          hasHydrated: true,
        })
        return
      }

      try {
        const accountResponse = await getUserAccount(persistedSession.cookie)
        const session = await requestAuthSession(
          persistedSession.loginMethod,
          accountResponse,
          persistedSession.cookie
        )

        if (!session.userId) {
          throw new Error('invalid auth response')
        }

        set({
          user: toUser(session),
          session,
          loginStatus: 'authenticated',
          hasHydrated: true,
        })
        useUserStore.getState().resetUserData()
        void useUserStore.getState().fetchLikedSongs()
        void useUserStore.getState().fetchLikedArtists()
        void useUserStore.getState().fetchLikedAlbums()
      } catch (validationError) {
        console.error('auth hydration failed', validationError)
        await clearPersistedSession()
        set({
          user: null,
          session: null,
          loginStatus: 'expired',
          hasHydrated: true,
        })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  openLoginDialog: (mode = DEFAULT_LOGIN_MODE) => {
    set({ dialogOpen: true, loginMode: mode, errorMessage: null })
  },

  closeLoginDialog: () => {
    set({ dialogOpen: false, errorMessage: null })
  },

  setLoginMode: mode => {
    set({ loginMode: mode, errorMessage: null })
  },

  clearError: () => {
    set({ errorMessage: null })
  },

  loginWithCurrentMode: async payload => {
    set({ isLoading: true, errorMessage: null })

    try {
      let response: unknown
      let loginMode: LoginMode = payload.mode

      if (payload.mode === 'email') {
        response = await loginWithEmail({
          email: payload.email,
          password: payload.password,
        })
        loginMode = 'email'
      } else if (payload.mode === 'phone-password') {
        response = await loginWithPhone({
          phone: payload.phone,
          password: payload.password,
          countrycode: payload.countrycode,
        })
        loginMode = 'phone-password'
      } else {
        response = await loginWithPhone({
          phone: payload.phone,
          captcha: payload.captcha,
          countrycode: payload.countrycode,
        })
        loginMode = 'phone-captcha'
      }

      const session = await requestAuthSession(loginMode, response)

      set({
        user: toUser(session),
        session,
        dialogOpen: false,
        loginStatus: 'authenticated',
        errorMessage: null,
      })
      useUserStore.getState().resetUserData()
      void useUserStore.getState().fetchLikedSongs()
      void useUserStore.getState().fetchLikedArtists()
      void useUserStore.getState().fetchLikedAlbums()
    } catch (error) {
      console.error('login failed', error)
      set({
        errorMessage:
          error instanceof Error ? error.message : '登录失败，请稍后重试',
      })
    } finally {
      set({ isLoading: false })
    }
  },

  sendCaptchaCode: async (phone, ctcode = '86') => {
    set({ isLoading: true, errorMessage: null })

    try {
      await sendLoginCaptcha({ phone, ctcode })
    } catch (error) {
      console.error('send captcha failed', error)
      set({
        errorMessage:
          error instanceof Error ? error.message : '验证码发送失败，请稍后重试',
      })
    } finally {
      set({ isLoading: false })
    }
  },

  refreshQrCode: async () => {
    set({ isLoading: true, errorMessage: null })

    try {
      qrPollGeneration += 1
      qrState = {
        ...qrState,
        polling: false,
      }

      const keyResponse = unwrapNestedData(
        (await getLoginQrKey()) as LoginQrKeyResponse
      )
      const key = keyResponse?.data?.unikey ?? keyResponse?.unikey ?? ''

      if (!key) {
        throw new Error('二维码 key 获取失败')
      }

      const qrResponse = unwrapNestedData(
        (await createLoginQr(key)) as LoginQrCreateResponse
      )
      const qrImg = qrResponse?.data?.qrimg ?? qrResponse?.qrimg ?? ''
      const qrUrl = qrResponse?.data?.qrurl ?? qrResponse?.qrurl ?? ''

      qrState = {
        ...qrState,
        key,
        qrImg,
        qrUrl,
        polling: false,
      }

      set({ errorMessage: null })
      return qrState
    } catch (error) {
      console.error('refresh qr failed', error)
      set({
        errorMessage:
          error instanceof Error ? error.message : '二维码刷新失败，请稍后重试',
      })
      return qrState
    } finally {
      set({ isLoading: false })
    }
  },

  pollQrLogin: async () => {
    if (!qrState.key || qrState.polling) {
      return
    }

    const currentGeneration = qrPollGeneration
    qrState = { ...qrState, polling: true }
    set({ isLoading: true, errorMessage: null })

    try {
      while (qrState.key && currentGeneration === qrPollGeneration) {
        const response = unwrapNestedData(
          (await checkLoginQr(qrState.key)) as LoginQrCheckResponse
        )
        const code = response?.code ?? response?.data?.code ?? 0

        if (code === 800) {
          throw new Error('二维码已失效，请刷新后重试')
        }

        if (code === 801) {
          await new Promise(resolve => window.setTimeout(resolve, 3000))
          continue
        }

        if (code === 802) {
          await new Promise(resolve => window.setTimeout(resolve, 3000))
          continue
        }

        if (code === 803) {
          const cookie = response?.cookie ?? response?.data?.cookie ?? ''
          const accountResponse = await getUserAccount(cookie)
          const session = await requestAuthSession(
            'qr',
            accountResponse,
            cookie
          )

          set({
            user: toUser(session),
            session,
            dialogOpen: false,
            loginStatus: 'authenticated',
            errorMessage: null,
          })
          useUserStore.getState().resetUserData()
          void useUserStore.getState().fetchLikedSongs()
          void useUserStore.getState().fetchLikedArtists()
          void useUserStore.getState().fetchLikedAlbums()
          return
        }

        throw new Error('二维码登录状态异常，请稍后重试')
      }
    } catch (error) {
      console.error('poll qr login failed', error)
      set({
        errorMessage:
          error instanceof Error ? error.message : '二维码登录失败，请稍后重试',
      })
    } finally {
      qrState = { ...qrState, polling: false }
      set({ isLoading: false })
    }
  },

  logout: async () => {
    set({ isLoading: true, errorMessage: null })

    try {
      await logoutRequest()
      await clearPersistedSession()
      useUserStore.getState().resetUserData()
      set({
        user: null,
        session: null,
        dialogOpen: false,
        loginStatus: 'anonymous',
        errorMessage: null,
      })
    } catch (error) {
      console.error('logout failed', error)
      set({
        errorMessage:
          error instanceof Error ? error.message : '退出登录失败，请稍后重试',
      })
    } finally {
      set({ isLoading: false })
    }
  },
}))

export const getQrLoginState = () => qrState

export const resetQrLoginState = () => {
  qrPollGeneration += 1
  qrState = {
    key: '',
    qrImg: '',
    qrUrl: '',
    polling: false,
  }
}

export const updateQrLoginState = (nextState: Partial<QrState>) => {
  qrState = {
    ...qrState,
    ...nextState,
  }
}
