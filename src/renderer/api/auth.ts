import type { AxiosResponse } from 'axios'
import request from '@/lib/request'
import type { RawAuthResponseBody } from '../../shared/auth'
import type {
  CaptchaParams,
  EmailLoginParams,
  PhoneLoginParams,
  QrLoginCheckParams,
} from '@/types/api'

function unwrapResponse<T>(response: AxiosResponse<T>) {
  return response.data
}

export function loginWithEmail(params: EmailLoginParams) {
  return request
    .post<RawAuthResponseBody>('/login', params)
    .then(unwrapResponse)
}

export function loginWithPhone(params: PhoneLoginParams) {
  return request
    .post<RawAuthResponseBody>('/login/cellphone', params)
    .then(unwrapResponse)
}

export function sendLoginCaptcha(params: CaptchaParams) {
  return request
    .post<RawAuthResponseBody>('/captcha/sent', {
      ctcode: params.ctcode ?? '86',
      phone: params.phone,
    })
    .then(unwrapResponse)
}

export function verifyLoginCaptcha(params: PhoneLoginParams) {
  return request
    .post<RawAuthResponseBody>('/captcha/verify', {
      ctcode: params.countrycode ?? '86',
      phone: params.phone,
      captcha: params.captcha,
    })
    .then(unwrapResponse)
}

export function getLoginQrKey() {
  return request
    .get<RawAuthResponseBody>('/login/qr/key', {
      params: {
        timestamp: Date.now(),
        ua: 'pc',
      },
    })
    .then(unwrapResponse)
}

export function createLoginQr(key: string) {
  return request
    .get<RawAuthResponseBody>('/login/qr/create', {
      params: {
        key,
        platform: 'web',
        qrimg: true,
        ua: 'pc',
        timestamp: Date.now(),
      },
    })
    .then(unwrapResponse)
}

export function checkLoginQr(key: QrLoginCheckParams['key']) {
  return request
    .get<RawAuthResponseBody>('/login/qr/check', {
      params: {
        key,
        ua: 'pc',
        timestamp: Date.now(),
      },
    })
    .then(unwrapResponse)
}

export function getLoginStatus(cookie: string) {
  return request
    .post<RawAuthResponseBody>(
      '/login/status',
      {
        cookie,
      },
      {
        params: {
          timestamp: Date.now(),
          ua: 'pc',
        },
      }
    )
    .then(unwrapResponse)
}

export function refreshLoginStatus() {
  return request
    .post<RawAuthResponseBody>('/login/refresh', null, {
      params: {
        timestamp: Date.now(),
        ua: 'pc',
      },
    })
    .then(unwrapResponse)
}

export function logout() {
  return request.post('/logout').then(unwrapResponse)
}
