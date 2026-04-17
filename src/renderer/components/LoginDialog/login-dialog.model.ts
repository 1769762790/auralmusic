import type { FormEventHandler } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { LucideIcon } from 'lucide-react'
import { QrCode, ShieldCheck } from 'lucide-react'

import type { LoginMode } from '@/api/auth'
import {
  LOGIN_FORM_DEFAULT_VALUES,
  type LoginFormValues,
} from './login-form.schema'

export type LoginFormState = LoginFormValues

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
  errors: FieldErrors<LoginFormState>
  register: UseFormRegister<LoginFormState>
  onSubmit: FormEventHandler<HTMLFormElement>
}

export interface PhoneCaptchaLoginPanelProps extends CredentialLoginPanelProps {
  onSendCaptcha: () => void
}

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
