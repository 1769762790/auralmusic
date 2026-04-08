import { useState } from 'react'
import type { FormEvent } from 'react'

import { useAuthStore } from '@/stores/auth-store'

import {
  LOGIN_FORM_INITIAL_STATE,
  type LoginFormState,
} from '../login-dialog.model'
import EmailLoginPanel from './EmailLoginPanel'
import PhoneCaptchaLoginPanel from './PhoneCaptchaLoginPanel'
import PhonePasswordLoginPanel from './PhonePasswordLoginPanel'
import QrLoginPanel from './QrLoginPanel'

const LoginForm = () => {
  const loginMode = useAuthStore(state => state.loginMode)
  const isLoading = useAuthStore(state => state.isLoading)
  const errorMessage = useAuthStore(state => state.errorMessage)
  const loginWithCurrentMode = useAuthStore(state => state.loginWithCurrentMode)
  const sendCaptchaCode = useAuthStore(state => state.sendCaptchaCode)
  const clearError = useAuthStore(state => state.clearError)

  const [form, setForm] = useState<LoginFormState>(LOGIN_FORM_INITIAL_STATE)
  const [localError, setLocalError] = useState('')

  const combinedError = localError || errorMessage || ''

  const updateForm = (field: keyof LoginFormState, value: string) => {
    clearError()
    setLocalError('')
    setForm(current => ({
      ...current,
      [field]: value,
    }))
  }

  const validate = () => {
    if (loginMode === 'email') {
      if (!form.email.trim()) return '请输入邮箱'
      if (!form.password.trim()) return '请输入密码'
    }

    if (loginMode === 'phone-password') {
      if (!form.phone.trim()) return '请输入手机号'
      if (!form.password.trim()) return '请输入密码'
    }

    if (loginMode === 'phone-captcha') {
      if (!form.phone.trim()) return '请输入手机号'
      if (!form.captcha.trim()) return '请输入验证码'
    }

    return ''
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const message = validate()
    if (message) {
      setLocalError(message)
      return
    }

    setLocalError('')
    clearError()

    if (loginMode === 'email') {
      await loginWithCurrentMode({
        mode: 'email',
        email: form.email.trim(),
        password: form.password,
      })
      return
    }

    if (loginMode === 'phone-password') {
      await loginWithCurrentMode({
        mode: 'phone-password',
        phone: form.phone.trim(),
        password: form.password,
        countrycode: form.countrycode || '86',
      })
      return
    }

    if (loginMode === 'phone-captcha') {
      await loginWithCurrentMode({
        mode: 'phone-captcha',
        phone: form.phone.trim(),
        captcha: form.captcha.trim(),
        countrycode: form.countrycode || '86',
      })
    }
  }

  const handleSendCaptcha = async () => {
    if (!form.phone.trim()) {
      setLocalError('请先输入手机号')
      return
    }

    setLocalError('')
    clearError()
    await sendCaptchaCode(form.phone.trim(), form.countrycode || '86')
  }

  const renderPanel = () => {
    switch (loginMode) {
      case 'email':
        return (
          <EmailLoginPanel
            form={form}
            isLoading={isLoading}
            onFieldChange={updateForm}
            onSubmit={handleSubmit}
          />
        )
      case 'phone-password':
        return (
          <PhonePasswordLoginPanel
            form={form}
            isLoading={isLoading}
            onFieldChange={updateForm}
            onSubmit={handleSubmit}
          />
        )
      case 'phone-captcha':
        return (
          <PhoneCaptchaLoginPanel
            form={form}
            isLoading={isLoading}
            onFieldChange={updateForm}
            onSendCaptcha={handleSendCaptcha}
            onSubmit={handleSubmit}
          />
        )
      case 'qr':
        return <QrLoginPanel />
      default:
        return null
    }
  }

  return (
    <div className='space-y-4'>
      {combinedError ? (
        <div className='border-destructive/20 bg-destructive/5 text-destructive rounded-[18px] border px-4 py-3 text-sm'>
          {combinedError}
        </div>
      ) : null}

      {renderPanel()}
    </div>
  )
}

export default LoginForm
