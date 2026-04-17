import type { BrowserWindow } from 'electron'

import type { StartedMusicApiRuntime } from '../server'

export function createMainAppState() {
  let mainWindow: BrowserWindow | null = null
  let isQuitting = false
  let musicApiRuntime: StartedMusicApiRuntime | null = null

  return {
    getMainWindow() {
      return mainWindow
    },
    setMainWindow(window: BrowserWindow | null) {
      mainWindow = window
    },
    clearMainWindow() {
      mainWindow = null
    },
    getIsQuitting() {
      return isQuitting
    },
    setIsQuitting(nextIsQuitting: boolean) {
      isQuitting = nextIsQuitting
    },
    getMusicApiRuntime() {
      return musicApiRuntime
    },
    setMusicApiRuntime(runtime: StartedMusicApiRuntime | null) {
      musicApiRuntime = runtime
    },
    clearMusicApiRuntime() {
      musicApiRuntime = null
    },
  }
}

export type MainAppState = ReturnType<typeof createMainAppState>
