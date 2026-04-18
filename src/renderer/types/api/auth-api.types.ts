import type { AuthLoginMethod } from '../../../shared/auth'

export interface EmailLoginParams {
  email: string
  password?: string
  md5_password?: string
}

export interface PhoneLoginParams {
  phone: string
  password?: string
  md5_password?: string
  captcha?: string
  countrycode?: string
}

export interface CaptchaParams {
  phone: string
  ctcode?: string
}

export interface QrLoginCheckParams {
  key: string
}

export type LoginMode = AuthLoginMethod
