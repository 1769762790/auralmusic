import electron from 'electron'
import { bootstrapMainApp } from './app/bootstrap'
import { registerLocalMediaScheme } from './protocol/local-media'

if (process.env.NODE_ENV_ELECTRON_VITE === 'development') {
  electron.app.commandLine.appendSwitch('remote-debugging-port', '9222')
}

registerLocalMediaScheme()
bootstrapMainApp()
