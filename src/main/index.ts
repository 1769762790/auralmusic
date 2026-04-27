import electron from 'electron'
import { bootstrapMainApp } from './app/bootstrap'
import { createMainLogger, initializeMainLogger } from './logging/logger'
import { registerLocalMediaScheme } from './protocol/local-media'

initializeMainLogger()
createMainLogger('bootstrap').info('main process bootstrap requested')

if (process.env.NODE_ENV_ELECTRON_VITE === 'development') {
  electron.app.commandLine.appendSwitch('remote-debugging-port', '9222')
}

registerLocalMediaScheme()
bootstrapMainApp()
