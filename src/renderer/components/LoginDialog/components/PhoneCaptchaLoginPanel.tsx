import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { PhoneCaptchaLoginPanelProps } from '../login-dialog.model'

const PhoneCaptchaLoginPanel = ({
  form,
  isLoading,
  onFieldChange,
  onSendCaptcha,
  onSubmit,
}: PhoneCaptchaLoginPanelProps) => {
  return (
    <form
      className='space-y-4 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_18px_70px_rgba(15,23,42,0.05)]'
      onSubmit={onSubmit}
    >
      <Field className='gap-2'>
        <FieldLabel className='text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase'>
          手机号
        </FieldLabel>
        <Input
          autoComplete='tel'
          className='h-10 bg-neutral-50 px-4 text-[15px]'
          placeholder='请输入手机号'
          value={form.phone}
          onChange={event => onFieldChange('phone', event.target.value)}
        />
      </Field>

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
            onChange={event => onFieldChange('captcha', event.target.value)}
          />
          <Button
            className='bg-primary/5 text-primary hover:bg-primary/10 h-10 px-4'
            disabled={isLoading}
            type='button'
            onClick={onSendCaptcha}
          >
            获取验证码
          </Button>
        </div>
      </Field>

      <Field className='gap-2'>
        <FieldLabel className='text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase'>
          国家区号
        </FieldLabel>
        <Input
          className='h-10 bg-neutral-50 px-4 text-[15px]'
          placeholder='86'
          value={form.countrycode}
          onChange={event => onFieldChange('countrycode', event.target.value)}
        />
      </Field>

      <Button
        className='h-10 w-full bg-neutral-950 text-base font-semibold text-white hover:bg-neutral-800'
        disabled={isLoading}
        type='submit'
      >
        {isLoading ? <Loader2 className='size-4 animate-spin' /> : null}
        登录
      </Button>
    </form>
  )
}

export default PhoneCaptchaLoginPanel
