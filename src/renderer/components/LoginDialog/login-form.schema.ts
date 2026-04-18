import { z } from 'zod'
import type { LoginFormMode, LoginFormValues } from './types'

export const LOGIN_FORM_DEFAULT_VALUES = {
  email: '',
  password: '',
  phone: '',
  captcha: '',
  countrycode: '86',
}

export const PHONE_PASSWORD_LOGIN_FIELD_NAMES = ['phone', 'password'] as const
export const PHONE_CAPTCHA_LOGIN_FIELD_NAMES = ['phone', 'captcha'] as const

const baseLoginFormSchema = z.object({
  email: z.string(),
  password: z.string(),
  phone: z.string(),
  captcha: z.string(),
  countrycode: z.string(),
}) satisfies z.ZodType<LoginFormValues>

const emailFormatSchema = z.string().email()
const CHINA_MAINLAND_PHONE_REGEX = /^1[3-9]\d{9}$/
const PHONE_VALIDATION_STRATEGIES: Record<
  string,
  {
    message: string
    validate: (phone: string) => boolean
  }
> = {
  '86': {
    message: '请输入11位数字的手机号',
    validate: phone => CHINA_MAINLAND_PHONE_REGEX.test(phone),
  },
}

function getPhoneValidationStrategy(countrycode: string) {
  return PHONE_VALIDATION_STRATEGIES[normalizeCountryCode(countrycode)]
}

const captchaRequestSchema = z
  .object({
    phone: z.string().trim().min(1, '请先输入手机号'),
    countrycode: z
      .string()
      .trim()
      .refine(value => !value || /^\d+$/.test(value), '请输入正确的国家区号')
      .transform(value => value || '86'),
  })
  .superRefine((values, context) => {
    const strategy = getPhoneValidationStrategy(values.countrycode)
    if (strategy && !strategy.validate(values.phone)) {
      context.addIssue({
        code: 'custom',
        path: ['phone'],
        message: strategy.message,
      })
    }
  })

function addIssue(
  context: z.RefinementCtx,
  field: keyof LoginFormValues,
  message: string
) {
  context.addIssue({
    code: 'custom',
    path: [field],
    message,
  })
}

function normalizeCountryCode(countrycode: string) {
  return countrycode.trim() || '86'
}

function validatePhoneByCountryCode(
  context: z.RefinementCtx,
  values: LoginFormValues
) {
  const phone = values.phone.trim()
  if (!phone) {
    addIssue(context, 'phone', '请输入手机号')
    return
  }

  const strategy = getPhoneValidationStrategy(values.countrycode)
  if (strategy && !strategy.validate(phone)) {
    addIssue(context, 'phone', strategy.message)
  }
}

export function getLoginFormSchema(mode: LoginFormMode) {
  return baseLoginFormSchema.superRefine((values, context) => {
    if (mode === 'email') {
      const email = values.email.trim()
      if (!email) {
        addIssue(context, 'email', '请输入邮箱')
      } else if (!emailFormatSchema.safeParse(email).success) {
        addIssue(context, 'email', '请输入正确的邮箱')
      }

      if (!values.password.trim()) {
        addIssue(context, 'password', '请输入密码')
      }
    }

    if (mode === 'phone-password') {
      validatePhoneByCountryCode(context, values)

      if (!values.password.trim()) {
        addIssue(context, 'password', '请输入密码')
      }
    }

    if (mode === 'phone-captcha') {
      validatePhoneByCountryCode(context, values)

      if (!values.captcha.trim()) {
        addIssue(context, 'captcha', '请输入验证码')
      }
    }

    if (
      (mode === 'phone-password' || mode === 'phone-captcha') &&
      values.countrycode.trim() &&
      !/^\d+$/.test(values.countrycode.trim())
    ) {
      addIssue(context, 'countrycode', '请输入正确的国家区号')
    }
  })
}

export function getCaptchaRequestPayload(values: LoginFormValues) {
  const result = captchaRequestSchema.safeParse({
    phone: values.phone,
    countrycode: values.countrycode,
  })

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || '请先输入手机号')
  }

  return result.data
}

export function buildLoginPayload(
  mode: LoginFormMode,
  values: LoginFormValues
) {
  if (mode === 'email') {
    return {
      mode,
      email: values.email.trim(),
      password: values.password,
    }
  }

  if (mode === 'phone-password') {
    return {
      mode,
      phone: values.phone.trim(),
      password: values.password,
      countrycode: normalizeCountryCode(values.countrycode),
    }
  }

  if (mode === 'phone-captcha') {
    return {
      mode,
      phone: values.phone.trim(),
      captcha: values.captcha.trim(),
      countrycode: normalizeCountryCode(values.countrycode),
    }
  }

  throw new Error('当前登录方式不支持表单提交')
}
