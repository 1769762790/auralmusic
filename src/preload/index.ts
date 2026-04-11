import { exposeAuthApi } from './api/auth-api'
import { exposeConfigApi } from './api/config-api'
import { exposeMusicSourceApi } from './api/music-source-api'
import { exposeRuntimeApi } from './api/runtime-api'
import { exposeWindowApi } from './api/window-api'

exposeAuthApi()
exposeConfigApi()
exposeMusicSourceApi()
exposeRuntimeApi()
exposeWindowApi()
