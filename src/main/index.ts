import { app, BrowserWindow, globalShortcut } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { bootstrapAuthSession } from './auth/store'
import { registerAuthIpc } from './ipc/auth-ipc'
import { registerConfigIpc } from './ipc/config-ipc'
import { applyMusicApiRuntimeEnv } from './music-api-runtime'
import { startMusicApi } from './server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

function getRendererUrl() {
  if (app.isPackaged) {
    return path.join(__dirname, '../renderer/index.html')
  }

  return process.env.ELECTRON_RENDERER_URL!
}

function getPreloadPath() {
  return path.join(__dirname, '../preload/index.js')
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 1280,
    minHeight: 760,
    titleBarStyle: 'hiddenInset',
    titleBarOverlay: {
      color: '#09090b',
      symbolColor: '#f5f7fb',
      height: 52,
    },
    autoHideMenuBar: true,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.setMenu(null)

  const rendererUrl = getRendererUrl()
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(rendererUrl)
  } else {
    mainWindow.loadFile(rendererUrl)
  }

  if (process.env.NODE_ENV_ELECTRON_VITE === 'development') {
    globalShortcut.register('Control+Shift+I', () => {
      mainWindow?.webContents.toggleDevTools()
    })
  }
}

app.whenReady().then(async () => {
  registerConfigIpc()
  registerAuthIpc()

  try {
    const runtimeInfo = await startMusicApi()
    applyMusicApiRuntimeEnv(runtimeInfo)
    await bootstrapAuthSession()
    createWindow()
  } catch (error) {
    console.error('Failed to bootstrap Music API runtime:', error)
    app.quit()
    return
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
