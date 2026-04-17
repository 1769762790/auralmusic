import test from 'node:test'
import assert from 'node:assert/strict'

import {
  LOGIN_FORM_DEFAULT_VALUES,
  PHONE_CAPTCHA_LOGIN_FIELD_NAMES,
  PHONE_PASSWORD_LOGIN_FIELD_NAMES,
  buildLoginPayload,
  getCaptchaRequestPayload,
  getLoginFormSchema,
} from '../src/renderer/components/LoginDialog/login-form.schema.ts'

test('getLoginFormSchema validates email login fields', () => {
  const schema = getLoginFormSchema('email')

  assert.equal(schema.safeParse(LOGIN_FORM_DEFAULT_VALUES).success, false)
  assert.equal(
    schema.safeParse({
      ...LOGIN_FORM_DEFAULT_VALUES,
      email: 'user@example.com',
      password: 'secret',
    }).success,
    true
  )
})

test('getLoginFormSchema validates phone password fields', () => {
  const schema = getLoginFormSchema('phone-password')

  assert.equal(
    schema.safeParse({
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: '13800138000',
      password: 'secret',
    }).success,
    true
  )

  assert.equal(
    schema.safeParse({
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: '13800138000',
      password: '',
    }).success,
    false
  )

  assert.equal(
    schema.safeParse({
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: '12800138000',
      password: 'secret',
    }).success,
    false
  )
})

test('phone login visible fields do not include countrycode', () => {
  assert.deepEqual(PHONE_PASSWORD_LOGIN_FIELD_NAMES, ['phone', 'password'])
  assert.deepEqual(PHONE_CAPTCHA_LOGIN_FIELD_NAMES, ['phone', 'captcha'])
})

test('getLoginFormSchema validates phone captcha fields', () => {
  const schema = getLoginFormSchema('phone-captcha')

  assert.equal(
    schema.safeParse({
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: '13800138000',
      captcha: '1234',
    }).success,
    true
  )

  assert.equal(
    schema.safeParse({
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: '',
      captcha: '1234',
    }).success,
    false
  )

  assert.equal(
    schema.safeParse({
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: '1380013800',
      captcha: '1234',
    }).success,
    false
  )
})

test('buildLoginPayload trims transport fields and preserves passwords', () => {
  assert.deepEqual(
    buildLoginPayload('email', {
      ...LOGIN_FORM_DEFAULT_VALUES,
      email: ' user@example.com ',
      password: ' secret ',
    }),
    {
      mode: 'email',
      email: 'user@example.com',
      password: ' secret ',
    }
  )

  assert.deepEqual(
    buildLoginPayload('phone-captcha', {
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: ' 13800138000 ',
      captcha: ' 1234 ',
      countrycode: '',
    }),
    {
      mode: 'phone-captcha',
      phone: '13800138000',
      captcha: '1234',
      countrycode: '86',
    }
  )
})

test('getCaptchaRequestPayload validates phone request fields', () => {
  assert.deepEqual(
    getCaptchaRequestPayload({
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: ' 13800138000 ',
      countrycode: '',
    }),
    {
      phone: '13800138000',
      countrycode: '86',
    }
  )

  assert.throws(() =>
    getCaptchaRequestPayload({
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: '',
    })
  )

  assert.throws(() =>
    getCaptchaRequestPayload({
      ...LOGIN_FORM_DEFAULT_VALUES,
      phone: '12800138000',
    })
  )
})
