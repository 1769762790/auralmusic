import { bootstrapMainApp } from './app/bootstrap'
import { registerLocalMediaScheme } from './protocol/local-media'

registerLocalMediaScheme()
bootstrapMainApp()
