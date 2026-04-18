import { QrCode } from 'lucide-react'

import { LOGIN_FORM_DEFAULT_VALUES } from './login-form.schema'
import type { LoginFormState, LoginModeOption } from './types'

export const LOGIN_FORM_INITIAL_STATE: LoginFormState =
  LOGIN_FORM_DEFAULT_VALUES

export const QR_LOGIN_EXPIRE_SECONDS = 180

export const LOGIN_MODE_OPTIONS: LoginModeOption[] = [
  // {
  //   value: 'email',
  //   label: '邮箱登录',
  //   shortLabel: '邮箱',
  //   icon: Mail,
  // },
  // {
  //   value: 'phone-password',
  //   label: '手机号密码',
  //   shortLabel: '密码',
  //   icon: Phone,
  // },
  // {
  //   value: 'phone-captcha',
  //   label: '验证码登录',
  //   shortLabel: '验证码',
  //   icon: ShieldCheck,
  // },
  {
    value: 'qr',
    label: '扫码登录',
    shortLabel: '扫码',
    icon: QrCode,
  },
]
