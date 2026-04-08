import type { LucideIcon } from 'lucide-react'
import { LockKeyhole, Mail, Phone, ScanLine } from 'lucide-react'
import type { LoginMode } from '@/api/auth'

export interface LoginFormState {
  email: string
  phone: string
  password: string
  captcha: string
  countrycode: string
}

export interface QrViewState {
  key: string
  qrImg: string
  qrUrl: string
  polling: boolean
}

export interface LoginModeOption {
  value: LoginMode
  label: string
  shortLabel: string
  icon: LucideIcon
}

export const LOGIN_MODE_OPTIONS: LoginModeOption[] = [
  { value: 'email', label: '邮箱', shortLabel: '邮箱', icon: Mail },
  {
    value: 'phone-password',
    label: '账号密码',
    shortLabel: '手机号',
    icon: Phone,
  },
  {
    value: 'phone-captcha',
    label: '验证码',
    shortLabel: '验证码',
    icon: LockKeyhole,
  },
  { value: 'qr', label: '扫码', shortLabel: '扫码', icon: ScanLine },
]

export const LOGIN_FORM_INITIAL_STATE: LoginFormState = {
  email: '',
  phone: '',
  password: '',
  captcha: '',
  countrycode: '86',
}

export const EMPTY_QR_VIEW_STATE: QrViewState = {
  key: '',
  qrImg: '',
  qrUrl: '',
  polling: false,
}

export const QR_LOGIN_EXPIRE_SECONDS = 120
