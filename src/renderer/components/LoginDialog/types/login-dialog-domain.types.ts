import type { FormEventHandler } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { LucideIcon } from 'lucide-react'

import type { LoginMode } from '@/types/api'

import type { LoginFormValues } from './login-form.types'

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
