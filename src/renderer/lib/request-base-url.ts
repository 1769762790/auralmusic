import type { ResolveRequestBaseUrlOptions } from '@/types/core'

function normalizeBaseUrl(baseUrl?: string) {
  const normalized = baseUrl?.trim()
  return normalized ? normalized : undefined
}

export function resolveRequestBaseUrl({
  runtimeBaseUrl,
  viteApiBaseUrl,
}: ResolveRequestBaseUrlOptions) {
  return normalizeBaseUrl(runtimeBaseUrl) ?? normalizeBaseUrl(viteApiBaseUrl)
}
