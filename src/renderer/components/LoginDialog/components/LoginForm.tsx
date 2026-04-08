import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, QrCode, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { resetQrLoginState, useAuthStore } from '@/stores/auth-store'
import {
  LOGIN_FORM_INITIAL_STATE,
  QR_LOGIN_EXPIRE_SECONDS,
  type LoginFormState,
  type QrViewState,
} from '../login-dialog.model'

type QrPanelStatus = 'loading' | 'active' | 'expired'

const LoginForm = () => {
  const loginMode = useAuthStore(state => state.loginMode)
  const isLoading = useAuthStore(state => state.isLoading)
  const errorMessage = useAuthStore(state => state.errorMessage)
  const loginWithCurrentMode = useAuthStore(state => state.loginWithCurrentMode)
  const sendCaptchaCode = useAuthStore(state => state.sendCaptchaCode)
  const clearError = useAuthStore(state => state.clearError)

  const [form, setForm] = useState<LoginFormState>(LOGIN_FORM_INITIAL_STATE)
  const [localError, setLocalError] = useState('')
  const [qrView, setQrView] = useState<QrViewState | null>(null)
  const [qrStatus, setQrStatus] = useState<QrPanelStatus>('loading')
  const [qrExpiresAt, setQrExpiresAt] = useState<number | null>(null)
  const [, setQrTick] = useState(0)
  const qrExpiryTimerRef = useRef<number | null>(null)

  const combinedError = localError || errorMessage || ''

  const clearQrExpiryTimer = useCallback(() => {
    if (qrExpiryTimerRef.current !== null) {
      window.clearTimeout(qrExpiryTimerRef.current)
      qrExpiryTimerRef.current = null
    }
  }, [])

  const resetQrLocalState = useCallback(() => {
    clearQrExpiryTimer()
    setQrView(null)
    setQrStatus('loading')
    setQrExpiresAt(null)
  }, [clearQrExpiryTimer])

  const expireQrCode = useCallback(() => {
    setQrStatus('expired')
    setQrExpiresAt(Date.now())
    resetQrLoginState()
  }, [])

  const scheduleQrExpiry = useCallback(
    (expiresAt: number) => {
      clearQrExpiryTimer()

      const delay = Math.max(expiresAt - Date.now(), 0)
      qrExpiryTimerRef.current = window.setTimeout(() => {
        qrExpiryTimerRef.current = null
        expireQrCode()
      }, delay)
    },
    [clearQrExpiryTimer, expireQrCode]
  )

  const activateQrCode = useCallback(
    (nextQr: QrViewState) => {
      const expiresAt = Date.now() + QR_LOGIN_EXPIRE_SECONDS * 1000
      setQrView(nextQr)
      setQrStatus('active')
      setQrExpiresAt(expiresAt)
      scheduleQrExpiry(expiresAt)
    },
    [scheduleQrExpiry]
  )

  const fetchQrCode = useCallback(async (): Promise<QrViewState | null> => {
    resetQrLoginState()
    resetQrLocalState()

    const { refreshQrCode, pollQrLogin } = useAuthStore.getState()
    const nextQr = await refreshQrCode()

    if (!nextQr.key) {
      return null
    }

    activateQrCode(nextQr)
    void pollQrLogin()
    return nextQr
  }, [activateQrCode, resetQrLocalState])

  const updateForm = (key: keyof LoginFormState, value: string) => {
    clearError()
    setLocalError('')
    setForm(current => ({
      ...current,
      [key]: value,
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

  const handleRefreshQrCode = useCallback(() => {
    void fetchQrCode().catch(() => {
      // store already surfaces the error message
    })
  }, [fetchQrCode])

  useEffect(() => {
    if (loginMode !== 'qr' || qrStatus !== 'active' || !qrExpiresAt) {
      return
    }

    const countdownTimer = window.setInterval(() => {
      setQrTick(value => value + 1)
    }, 1000)

    return () => {
      window.clearInterval(countdownTimer)
    }
  }, [loginMode, qrExpiresAt, qrStatus])

  useEffect(() => {
    if (loginMode !== 'qr') {
      resetQrLocalState()
      resetQrLoginState()
      return
    }

    let isActive = true

    void fetchQrCode().catch(() => {
      if (isActive) {
        setQrStatus('loading')
      }
    })

    return () => {
      isActive = false
      clearQrExpiryTimer()
      resetQrLoginState()
    }
  }, [clearQrExpiryTimer, fetchQrCode, loginMode, resetQrLocalState])

  if (loginMode === 'qr') {
    return (
      <div className='space-y-4 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_18px_70px_rgba(15,23,42,0.05)]'>
        {combinedError ? (
          <div className='border-destructive/20 bg-destructive/5 text-destructive rounded-[18px] border px-4 py-3 text-sm'>
            {combinedError}
          </div>
        ) : null}

        <div className='space-y-4'>
          {/* <div className='flex items-center justify-between gap-4'>
            <div className='space-y-1'>
              <h2 className='text-xl font-bold text-neutral-950'>扫码登录</h2>
              <p className='text-sm leading-6 text-neutral-500'>
                打开网易云音乐 App，进入扫一扫，对准下方二维码完成登录。
              </p>
            </div>

            <div className='bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl'>
              <QrCode className='size-6' />
            </div>
          </div> */}

          <div className='mx-auto w-full max-w-[320px]'>
            <div className='from-background via-muted/40 to-background relative flex min-h-[250px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br'>
              <div className='bg-background relative overflow-hidden rounded-[24px] border shadow-lg'>
                {qrView?.qrImg ? (
                  <img
                    alt='扫码登录二维码'
                    className='size-[200px] rounded-[18px] object-contain'
                    draggable={false}
                    src={qrView.qrImg}
                  />
                ) : (
                  <div className='text-muted-foreground flex size-[200px] items-center justify-center rounded-[18px] bg-neutral-100 text-sm'>
                    正在生成二维码...
                  </div>
                )}
                {qrStatus === 'expired' ? (
                  <div
                    className='absolute inset-0 flex cursor-pointer items-center justify-center border-0 bg-black/30 px-6 text-center text-white backdrop-blur-sm'
                    onClick={handleRefreshQrCode}
                  >
                    <div className='flex flex-col items-center gap-4'>
                      <div className='text-sm font-medium'>
                        <RotateCcw className='inline size-4' />
                        重新获取二维码
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <p className='text-primary/50 text-center text-xs leading-6'>
            请使用网易云音乐 App 扫码，二维码通常只会短暂有效。
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      className='space-y-4 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_18px_70px_rgba(15,23,42,0.05)]'
      onSubmit={handleSubmit}
    >
      <Field className='gap-2'>
        <FieldContent className='space-y-4'>
          {loginMode === 'email' ||
          loginMode === 'phone-password' ||
          loginMode === 'phone-captcha' ? (
            <Field className='gap-2'>
              <FieldLabel className='text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase'>
                {loginMode === 'email' ? '邮箱' : '手机号'}
              </FieldLabel>
              <Input
                autoComplete={loginMode === 'email' ? 'email' : 'tel'}
                className='h-10 bg-neutral-50 px-4 text-[15px]'
                placeholder={
                  loginMode === 'email' ? 'm@example.com' : '请输入手机号'
                }
                value={loginMode === 'email' ? form.email : form.phone}
                onChange={event =>
                  updateForm(
                    loginMode === 'email' ? 'email' : 'phone',
                    event.target.value
                  )
                }
              />
            </Field>
          ) : null}

          {loginMode === 'phone-captcha' ? (
            <Field className='gap-2'>
              <FieldLabel className='text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase'>
                验证码
              </FieldLabel>
              <div className='flex gap-3'>
                <Input
                  autoComplete='one-time-code'
                  className='h-10 bg-neutral-50 px-4 text-[15px]'
                  placeholder='请输入验证码'
                  value={form.captcha}
                  onChange={event => updateForm('captcha', event.target.value)}
                />
                <Button
                  type='button'
                  className='bg-primary/4 text-primary/50 h-10 px-4'
                  disabled={isLoading}
                  onClick={() => {
                    void handleSendCaptcha()
                  }}
                >
                  获取验证码
                </Button>
              </div>
            </Field>
          ) : null}

          {loginMode === 'email' || loginMode === 'phone-password' ? (
            <Field className='gap-2'>
              <FieldLabel className='text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase'>
                密码
              </FieldLabel>
              <Input
                autoComplete='current-password'
                className='h-10 bg-neutral-50 px-4 text-[15px]'
                placeholder='请输入密码'
                type='password'
                value={form.password}
                onChange={event => updateForm('password', event.target.value)}
              />
            </Field>
          ) : null}

          {loginMode === 'phone-password' || loginMode === 'phone-captcha' ? (
            <Field className='gap-2'>
              <FieldLabel className='text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase'>
                国家码
              </FieldLabel>
              <Input
                className='h-10 bg-neutral-50 px-4 text-[15px]'
                placeholder='86'
                value={form.countrycode}
                onChange={event =>
                  updateForm('countrycode', event.target.value)
                }
              />
            </Field>
          ) : null}
        </FieldContent>
      </Field>

      {combinedError ? (
        <div className='border-destructive/20 bg-destructive/5 text-destructive rounded-[18px] border px-4 py-3 text-sm'>
          {combinedError}
        </div>
      ) : null}

      <Button
        className='h-10 w-full bg-neutral-950 text-base font-semibold text-white hover:bg-neutral-800'
        disabled={isLoading}
        type='submit'
      >
        {isLoading ? <Loader2 className='size-4 animate-spin' /> : null}
        提交
      </Button>
    </form>
  )
}

export default LoginForm
