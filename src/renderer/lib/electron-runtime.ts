import type { RuntimeApi } from '@preload/api/runtime-api'
import type { WindowApi } from '@preload/api/window-api'

type ElectronRuntimeWindow = {
  appRuntime?: RuntimeApi
  electronWindow?: WindowApi
}

const missingApiWarnings = new Set<string>()

function getDefaultWindowLike(): ElectronRuntimeWindow {
  if (typeof window === 'undefined') {
    return {}
  }

  return window as unknown as ElectronRuntimeWindow
}

function warnMissingPreloadApi(
  apiName: keyof ElectronRuntimeWindow,
  target: ElectronRuntimeWindow
) {
  if (typeof window === 'undefined' || target !== getDefaultWindowLike()) {
    return
  }

  if (missingApiWarnings.has(apiName)) {
    return
  }

  missingApiWarnings.add(apiName)
  console.warn(`preload api "${apiName}" is unavailable`)
}

export function getAppRuntime(
  target: ElectronRuntimeWindow = getDefaultWindowLike()
) {
  const runtimeApi = target.appRuntime ?? null
  if (!runtimeApi) {
    warnMissingPreloadApi('appRuntime', target)
  }

  return runtimeApi
}

export function getElectronWindowApi(
  target: ElectronRuntimeWindow = getDefaultWindowLike()
) {
  const windowApi = target.electronWindow ?? null
  if (!windowApi) {
    warnMissingPreloadApi('electronWindow', target)
  }

  return windowApi
}

export function isWindowsPlatform(
  target: ElectronRuntimeWindow = getDefaultWindowLike()
) {
  return getAppRuntime(target)?.getPlatform() === 'win32'
}
