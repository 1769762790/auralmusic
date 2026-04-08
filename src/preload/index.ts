import { exposeAuthApi } from './api/auth-api'
import { exposeConfigApi } from './api/config-api'
import { exposeRuntimeApi } from './api/runtime-api'

exposeAuthApi()
exposeConfigApi()
exposeRuntimeApi()
