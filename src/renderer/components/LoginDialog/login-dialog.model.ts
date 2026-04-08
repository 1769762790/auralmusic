import type { FormEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Mail, Phone, QrCode, ShieldCheck } from 'lucide-react'

import type { LoginMode } from '@/api/auth'

export interface LoginFormState {
  email: string
  password: string
  phone: string
  captcha: string
  countrycode: string
}

export interface QrViewState {
  key: string
  qrImg: string
  qrUrl: string
}

export interface LoginModeOption {
  value: LoginMode
  label: string
  shortLabel: string
  icon: LucideIcon
}

export interface LoginPanelBaseProps {
  isLoading: boolean
}

export interface CredentialLoginPanelProps extends LoginPanelBaseProps {
  form: LoginFormState
  onFieldChange: (field: keyof LoginFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export interface PhoneCaptchaLoginPanelProps extends CredentialLoginPanelProps {
  onSendCaptcha: () => void
}

export const LOGIN_FORM_INITIAL_STATE: LoginFormState = {
  email: '',
  password: '',
  phone: '',
  captcha: '',
  countrycode: '86',
}

export const QR_LOGIN_EXPIRE_SECONDS = 180

export const LOGIN_MODE_OPTIONS: LoginModeOption[] = [
  {
    value: 'email',
    label: '邮箱登录',
    shortLabel: '邮箱',
    icon: Mail,
  },
  {
    value: 'phone-password',
    label: '手机号密码',
    shortLabel: '密码',
    icon: Phone,
  },
  {
    value: 'phone-captcha',
    label: '验证码登录',
    shortLabel: '验证码',
    icon: ShieldCheck,
  },
  {
    value: 'qr',
    label: '扫码登录',
    shortLabel: '扫码',
    icon: QrCode,
  },
]
