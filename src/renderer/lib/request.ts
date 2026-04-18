import axios from 'axios'
import { resolveRequestBaseUrl } from './request-base-url.ts'
import type { CustomAxiosRequestConfig } from '@/types/core'

const runtimeBaseUrl =
  typeof window !== 'undefined'
    ? window.appRuntime?.getMusicApiBaseUrl()
    : undefined
const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string> })
  .env

const baseURL = resolveRequestBaseUrl({
  runtimeBaseUrl,
  viteApiBaseUrl: viteEnv?.VITE_API,
})

const request = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
})

const MAX_RETRIES = 1
const RETRY_DELAY = 500

request.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  config.retryCount = config.retryCount || 0
  return config
})

request.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config as CustomAxiosRequestConfig | undefined
    if (!config || config.noRetry) {
      return Promise.reject(error)
    }

    if (config.retryCount !== undefined && config.retryCount < MAX_RETRIES) {
      config.retryCount += 1
      console.error(`request retry #${config.retryCount}`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return request(config)
    }

    console.error(`request failed after ${MAX_RETRIES} retries`)
    return Promise.reject(error)
  }
)

export default request
