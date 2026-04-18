export type LoginFormMode = 'email' | 'phone-password' | 'phone-captcha' | 'qr'

export interface LoginFormValues {
  email: string
  password: string
  phone: string
  captcha: string
  countrycode: string
}
