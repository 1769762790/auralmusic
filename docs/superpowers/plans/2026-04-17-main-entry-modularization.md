# Main Entry Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `src/main/index.ts` into focused main-process modules while preserving existing startup, window, IPC, tray, permission, and lifecycle behavior.

**Architecture:** Keep `index.ts` as the only entrypoint, but move orchestration into `src/main/app/bootstrap.ts`. Extract runtime state, app lifecycle binding, IPC aggregation, window path/option helpers, main window creation, and permission handling into focused modules with small node-test coverage.

**Tech Stack:** Electron, electron-vite, TypeScript, Node `node:test`, Node `assert/strict`, existing `pnpm lint` and `tsconfig.node.json`.

---

## File Structure

- Create: `src/main/window/window-paths.ts`
  Resolves packaged renderer file path, development renderer URL target, and preload path.

- Create: `src/main/window/permission.ts`
  Owns audio permission policy and session permission handler registration.

- Create: `src/main/ipc/register-main-ipc.ts`
  Aggregates all main-process IPC registration calls behind one function.

- Create: `src/main/app/app-state.ts`
  Encapsulates `mainWindow`, `isQuitting`, and `musicApiRuntime` runtime state.

- Create: `src/main/app/lifecycle.ts`
  Binds Electron app lifecycle events using injected dependencies.

- Create: `src/main/window/main-window.ts`
  Owns `BrowserWindow` option creation, renderer loading, close behavior binding, titlebar theme sync, DevTools shortcut registration, and configured shortcut cleanup.

- Create: `src/main/app/bootstrap.ts`
  Orchestrates app startup using the extracted modules.

- Modify: `src/main/index.ts`
  Reduce to scheme registration and `bootstrapMainApp()`.

- Create tests:
  - `tests/main-window-paths.test.ts`
  - `tests/window-permission.test.ts`
  - `tests/register-main-ipc.test.ts`
  - `tests/main-app-state.test.ts`
  - `tests/main-lifecycle.test.ts`
  - `tests/main-window-options.test.ts`

Important workspace note: this repo may already contain unrelated staged changes. Each commit step below must stage only the listed task files. Use `git commit --only -- <paths...>` when committing, or skip commits if the user asks to keep all work uncommitted.

---

### Task 1: Extract Window Path Resolution

**Files:**

- Create: `tests/main-window-paths.test.ts`
- Create: `src/main/window/window-paths.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/main-window-paths.test.ts`:

```ts
import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'

import {
  resolvePreloadPath,
  resolveRendererLoadTarget,
} from '../src/main/window/window-paths.ts'

test('resolveRendererLoadTarget uses packaged renderer html when app is packaged', () => {
  const mainDirname = path.join('F:', 'code-demo', 'AuralMusic', 'out', 'main')

  assert.deepEqual(
    resolveRendererLoadTarget({
      appIsPackaged: true,
      mainDirname,
      rendererUrl: 'http://localhost:5173',
    }),
    {
      type: 'file',
      value: path.join(mainDirname, '../renderer/index.html'),
    }
  )
})

test('resolveRendererLoadTarget uses development renderer url when app is not packaged', () => {
  assert.deepEqual(
    resolveRendererLoadTarget({
      appIsPackaged: false,
      mainDirname: 'ignored',
      rendererUrl: 'http://localhost:5173',
    }),
    {
      type: 'url',
      value: 'http://localhost:5173',
    }
  )
})

test('resolveRendererLoadTarget fails clearly when development renderer url is missing', () => {
  assert.throws(
    () =>
      resolveRendererLoadTarget({
        appIsPackaged: false,
        mainDirname: 'ignored',
        rendererUrl: '',
      }),
    /ELECTRON_RENDERER_URL/
  )
})

test('resolvePreloadPath points to the built preload cjs file', () => {
  const mainDirname = path.join('F:', 'code-demo', 'AuralMusic', 'out', 'main')

  assert.equal(
    resolvePreloadPath(mainDirname),
    path.join(mainDirname, '../preload/index.cjs')
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node tests/main-window-paths.test.ts
```

Expected: FAIL with `Cannot find module ... src/main/window/window-paths.ts`.

- [ ] **Step 3: Implement path helpers**

Create `src/main/window/window-paths.ts`:

```ts
import path from 'node:path'

type RendererLoadTarget =
  | {
      type: 'file'
      value: string
    }
  | {
      type: 'url'
      value: string
    }

type RendererLoadTargetOptions = {
  appIsPackaged: boolean
  mainDirname: string
  rendererUrl?: string
}

export function resolveRendererLoadTarget({
  appIsPackaged,
  mainDirname,
  rendererUrl,
}: RendererLoadTargetOptions): RendererLoadTarget {
  if (appIsPackaged) {
    return {
      type: 'file',
      value: path.join(mainDirname, '../renderer/index.html'),
    }
  }

  if (!rendererUrl) {
    throw new Error('ELECTRON_RENDERER_URL is required in development')
  }

  return {
    type: 'url',
    value: rendererUrl,
  }
}

export function resolvePreloadPath(mainDirname: string) {
  return path.join(mainDirname, '../preload/index.cjs')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node tests/main-window-paths.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit only task files**

Run:

```powershell
git add -- tests/main-window-paths.test.ts src/main/window/window-paths.ts
git commit --only -- tests/main-window-paths.test.ts src/main/window/window-paths.ts -m "refactor: extract main window path helpers"
```

---

### Task 2: Extract Window Permission Policy

**Files:**

- Create: `tests/window-permission.test.ts`
- Create: `src/main/window/permission.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/window-permission.test.ts`:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isAllowedAudioPermission,
  registerWindowPermissionHandlers,
} from '../src/main/window/permission.ts'

test('isAllowedAudioPermission allows speaker selection', () => {
  assert.equal(isAllowedAudioPermission('speaker-selection'), true)
})

test('isAllowedAudioPermission allows audio-only media requests', () => {
  assert.equal(
    isAllowedAudioPermission('media', {
      mediaTypes: ['audio'],
    }),
    true
  )
  assert.equal(
    isAllowedAudioPermission('media', {
      mediaType: 'audio',
    }),
    true
  )
})

test('isAllowedAudioPermission rejects non-audio media and unrelated permissions', () => {
  assert.equal(
    isAllowedAudioPermission('media', {
      mediaTypes: ['audio', 'video'],
    }),
    false
  )
  assert.equal(
    isAllowedAudioPermission('media', {
      mediaType: 'video',
    }),
    false
  )
  assert.equal(isAllowedAudioPermission('notifications'), false)
})

test('registerWindowPermissionHandlers gates requests by source web contents', () => {
  const mainWebContents = { id: 1 }
  const otherWebContents = { id: 2 }
  let checkHandler:
    | ((
        webContents: unknown,
        permission: unknown,
        requestingOrigin: string,
        details: unknown
      ) => boolean)
    | null = null
  let requestHandler:
    | ((
        webContents: unknown,
        permission: unknown,
        callback: (allowed: boolean) => void,
        details: unknown
      ) => void)
    | null = null

  registerWindowPermissionHandlers({
    session: {
      defaultSession: {
        setPermissionCheckHandler: handler => {
          checkHandler = handler
        },
        setPermissionRequestHandler: handler => {
          requestHandler = handler
        },
      },
    },
    isAllowedWebContents: webContents => webContents === mainWebContents,
  })

  assert.equal(
    checkHandler?.(mainWebContents, 'media', '', { mediaTypes: ['audio'] }),
    true
  )
  assert.equal(
    checkHandler?.(otherWebContents, 'media', '', { mediaTypes: ['audio'] }),
    false
  )

  const requestResults: boolean[] = []
  requestHandler?.(
    mainWebContents,
    'media',
    allowed => requestResults.push(allowed),
    { mediaTypes: ['video'] }
  )

  assert.deepEqual(requestResults, [false])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node tests/window-permission.test.ts
```

Expected: FAIL with `Cannot find module ... src/main/window/permission.ts`.

- [ ] **Step 3: Implement permission module**

Create `src/main/window/permission.ts`:

```ts
type AudioPermissionDetails = {
  mediaType?: string
  mediaTypes?: string[]
}

type PermissionSession = {
  defaultSession: {
    setPermissionCheckHandler: (
      handler: (
        webContents: unknown,
        permission: unknown,
        requestingOrigin: string,
        details: unknown
      ) => boolean
    ) => void
    setPermissionRequestHandler: (
      handler: (
        webContents: unknown,
        permission: unknown,
        callback: (allowed: boolean) => void,
        details: unknown
      ) => void
    ) => void
  }
}

type RegisterWindowPermissionHandlersOptions = {
  session: PermissionSession
  isAllowedWebContents: (webContents: unknown) => boolean
}

export function isAllowedAudioPermission(
  permission: string,
  details?: AudioPermissionDetails
) {
  if (permission === 'speaker-selection') {
    return true
  }

  if (permission !== 'media') {
    return false
  }

  const mediaTypes = details?.mediaTypes || []
  const mediaType = details?.mediaType
  if (!mediaTypes.length && mediaType) {
    return mediaType === 'audio'
  }

  return mediaTypes.includes('audio') && !mediaTypes.includes('video')
}

export function registerWindowPermissionHandlers({
  session,
  isAllowedWebContents,
}: RegisterWindowPermissionHandlersOptions) {
  session.defaultSession.setPermissionCheckHandler(
    (webContents, permission, _requestingOrigin, details) => {
      return (
        isAllowedWebContents(webContents) &&
        isAllowedAudioPermission(
          String(permission),
          details as AudioPermissionDetails
        )
      )
    }
  )

  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback, details) => {
      callback(
        isAllowedWebContents(webContents) &&
          isAllowedAudioPermission(
            String(permission),
            details as AudioPermissionDetails
          )
      )
    }
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node tests/window-permission.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit only task files**

Run:

```powershell
git add -- tests/window-permission.test.ts src/main/window/permission.ts
git commit --only -- tests/window-permission.test.ts src/main/window/permission.ts -m "refactor: extract main window permission policy"
```

---

### Task 3: Extract Main IPC Aggregator

**Files:**

- Create: `tests/register-main-ipc.test.ts`
- Create: `src/main/ipc/register-main-ipc.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/register-main-ipc.test.ts`:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'

import { createRegisterMainIpc } from '../src/main/ipc/register-main-ipc.ts'

test('createRegisterMainIpc registers every main ipc module with supplied options', () => {
  const calls: string[] = []
  const trayController = { initialize: () => undefined }
  const onShortcutConfigChange = () => undefined
  const onAutoStartConfigChange = () => undefined
  const onQuitRequested = () => undefined

  const registerMainIpc = createRegisterMainIpc({
    registerAuthIpc: () => calls.push('auth'),
    registerCacheIpc: () => calls.push('cache'),
    registerConfigIpc: options => {
      calls.push('config')
      assert.equal(options.onShortcutConfigChange, onShortcutConfigChange)
      assert.equal(options.onAutoStartConfigChange, onAutoStartConfigChange)
    },
    registerDownloadIpc: () => calls.push('download'),
    registerMusicSourceIpc: () => calls.push('music-source'),
    registerSystemFontsIpc: () => calls.push('system-fonts'),
    registerTrayIpc: options => {
      calls.push('tray')
      assert.equal(options.trayController, trayController)
    },
    registerWindowIpc: options => {
      calls.push('window')
      assert.equal(options.onQuitRequested, onQuitRequested)
    },
  })

  registerMainIpc({
    onShortcutConfigChange,
    onAutoStartConfigChange,
    trayController,
    onQuitRequested,
  })

  assert.deepEqual(calls, [
    'config',
    'auth',
    'cache',
    'download',
    'music-source',
    'system-fonts',
    'tray',
    'window',
  ])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node tests/register-main-ipc.test.ts
```

Expected: FAIL with `Cannot find module ... src/main/ipc/register-main-ipc.ts`.

- [ ] **Step 3: Implement IPC aggregator**

Create `src/main/ipc/register-main-ipc.ts`:

```ts
import { registerAuthIpc } from './auth-ipc'
import { registerCacheIpc } from './cache-ipc'
import { registerConfigIpc } from './config-ipc'
import { registerDownloadIpc } from './download-ipc'
import { registerMusicSourceIpc } from './music-source-ipc'
import { registerSystemFontsIpc } from './system-fonts-ipc'
import { registerTrayIpc } from './tray-ipc'
import { registerWindowIpc } from './window-ipc'

type ConfigIpcOptions = Parameters<typeof registerConfigIpc>[0]
type TrayIpcOptions = Parameters<typeof registerTrayIpc>[0]
type WindowIpcOptions = Parameters<typeof registerWindowIpc>[0]

type RegisterMainIpcOptions = ConfigIpcOptions &
  TrayIpcOptions &
  WindowIpcOptions

type RegisterMainIpcDependencies = {
  registerAuthIpc: typeof registerAuthIpc
  registerCacheIpc: typeof registerCacheIpc
  registerConfigIpc: typeof registerConfigIpc
  registerDownloadIpc: typeof registerDownloadIpc
  registerMusicSourceIpc: typeof registerMusicSourceIpc
  registerSystemFontsIpc: typeof registerSystemFontsIpc
  registerTrayIpc: typeof registerTrayIpc
  registerWindowIpc: typeof registerWindowIpc
}

export function createRegisterMainIpc(
  dependencies: RegisterMainIpcDependencies
) {
  return function registerMainIpc(options: RegisterMainIpcOptions) {
    dependencies.registerConfigIpc({
      onShortcutConfigChange: options.onShortcutConfigChange,
      onAutoStartConfigChange: options.onAutoStartConfigChange,
    })
    dependencies.registerAuthIpc()
    dependencies.registerCacheIpc()
    dependencies.registerDownloadIpc()
    dependencies.registerMusicSourceIpc()
    dependencies.registerSystemFontsIpc()
    dependencies.registerTrayIpc({
      trayController: options.trayController,
    })
    dependencies.registerWindowIpc({
      onQuitRequested: options.onQuitRequested,
    })
  }
}

export const registerMainIpc = createRegisterMainIpc({
  registerAuthIpc,
  registerCacheIpc,
  registerConfigIpc,
  registerDownloadIpc,
  registerMusicSourceIpc,
  registerSystemFontsIpc,
  registerTrayIpc,
  registerWindowIpc,
})
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node tests/register-main-ipc.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit only task files**

Run:

```powershell
git add -- tests/register-main-ipc.test.ts src/main/ipc/register-main-ipc.ts
git commit --only -- tests/register-main-ipc.test.ts src/main/ipc/register-main-ipc.ts -m "refactor: aggregate main ipc registration"
```

---

### Task 4: Extract Main App Runtime State

**Files:**

- Create: `tests/main-app-state.test.ts`
- Create: `src/main/app/app-state.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/main-app-state.test.ts`:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'

import { createMainAppState } from '../src/main/app/app-state.ts'

test('createMainAppState stores main window, quitting flag, and runtime', () => {
  const state = createMainAppState()
  const window = { id: 1 }
  const runtime = { dispose: () => undefined }

  assert.equal(state.getMainWindow(), null)
  assert.equal(state.getIsQuitting(), false)
  assert.equal(state.getMusicApiRuntime(), null)

  state.setMainWindow(window)
  state.setIsQuitting(true)
  state.setMusicApiRuntime(runtime)

  assert.equal(state.getMainWindow(), window)
  assert.equal(state.getIsQuitting(), true)
  assert.equal(state.getMusicApiRuntime(), runtime)

  state.clearMainWindow()
  state.clearMusicApiRuntime()

  assert.equal(state.getMainWindow(), null)
  assert.equal(state.getMusicApiRuntime(), null)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node tests/main-app-state.test.ts
```

Expected: FAIL with `Cannot find module ... src/main/app/app-state.ts`.

- [ ] **Step 3: Implement app state module**

Create `src/main/app/app-state.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node tests/main-app-state.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit only task files**

Run:

```powershell
git add -- tests/main-app-state.test.ts src/main/app/app-state.ts
git commit --only -- tests/main-app-state.test.ts src/main/app/app-state.ts -m "refactor: extract main app state"
```

---

### Task 5: Extract App Lifecycle Binding

**Files:**

- Create: `tests/main-lifecycle.test.ts`
- Create: `src/main/app/lifecycle.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/main-lifecycle.test.ts`:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'

import { registerMainAppLifecycle } from '../src/main/app/lifecycle.ts'

test('registerMainAppLifecycle binds activate to show existing window', () => {
  const handlers = new Map<string, () => void>()
  const calls: string[] = []
  const window = { id: 1 }

  registerMainAppLifecycle({
    app: {
      on: (event, handler) => {
        handlers.set(event, handler)
      },
      quit: () => calls.push('quit'),
    },
    platform: 'win32',
    getMainWindow: () => window,
    getWindowCount: () => 1,
    showMainWindow: () => calls.push('show'),
    createWindow: () => calls.push('create'),
    setIsQuitting: () => calls.push('set-quitting'),
    disposeMusicApiRuntime: () => calls.push('dispose-runtime'),
    destroyTray: () => calls.push('destroy-tray'),
    clearConfiguredGlobalShortcuts: () => calls.push('clear-shortcuts'),
  })

  handlers.get('activate')?.()

  assert.deepEqual(calls, ['show'])
})

test('registerMainAppLifecycle creates a window on activate when no windows exist', () => {
  const handlers = new Map<string, () => void>()
  const calls: string[] = []

  registerMainAppLifecycle({
    app: {
      on: (event, handler) => {
        handlers.set(event, handler)
      },
      quit: () => calls.push('quit'),
    },
    platform: 'darwin',
    getMainWindow: () => null,
    getWindowCount: () => 0,
    showMainWindow: () => calls.push('show'),
    createWindow: () => calls.push('create'),
    setIsQuitting: () => calls.push('set-quitting'),
    disposeMusicApiRuntime: () => calls.push('dispose-runtime'),
    destroyTray: () => calls.push('destroy-tray'),
    clearConfiguredGlobalShortcuts: () => calls.push('clear-shortcuts'),
  })

  handlers.get('activate')?.()

  assert.deepEqual(calls, ['create'])
})

test('registerMainAppLifecycle handles quit lifecycle cleanup', () => {
  const handlers = new Map<string, () => void>()
  const calls: string[] = []

  registerMainAppLifecycle({
    app: {
      on: (event, handler) => {
        handlers.set(event, handler)
      },
      quit: () => calls.push('quit'),
    },
    platform: 'win32',
    getMainWindow: () => null,
    getWindowCount: () => 0,
    showMainWindow: () => calls.push('show'),
    createWindow: () => calls.push('create'),
    setIsQuitting: value => calls.push(`set-quitting:${value}`),
    disposeMusicApiRuntime: () => calls.push('dispose-runtime'),
    destroyTray: () => calls.push('destroy-tray'),
    clearConfiguredGlobalShortcuts: () => calls.push('clear-shortcuts'),
  })

  handlers.get('window-all-closed')?.()
  handlers.get('before-quit')?.()
  handlers.get('will-quit')?.()

  assert.deepEqual(calls, [
    'quit',
    'set-quitting:true',
    'dispose-runtime',
    'destroy-tray',
    'clear-shortcuts',
  ])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node tests/main-lifecycle.test.ts
```

Expected: FAIL with `Cannot find module ... src/main/app/lifecycle.ts`.

- [ ] **Step 3: Implement lifecycle module**

Create `src/main/app/lifecycle.ts`:

```ts
import type { BrowserWindow } from 'electron'

type MainLifecycleApp = {
  on: (event: string, handler: () => void) => void
  quit: () => void
}

type RegisterMainAppLifecycleOptions = {
  app: MainLifecycleApp
  platform: NodeJS.Platform
  getMainWindow: () => BrowserWindow | null
  getWindowCount: () => number
  showMainWindow: () => void
  createWindow: () => void
  setIsQuitting: (isQuitting: boolean) => void
  disposeMusicApiRuntime: () => void
  destroyTray: () => void
  clearConfiguredGlobalShortcuts: () => void
}

export function registerMainAppLifecycle({
  app,
  platform,
  getMainWindow,
  getWindowCount,
  showMainWindow,
  createWindow,
  setIsQuitting,
  disposeMusicApiRuntime,
  destroyTray,
  clearConfiguredGlobalShortcuts,
}: RegisterMainAppLifecycleOptions) {
  app.on('activate', () => {
    if (getMainWindow()) {
      showMainWindow()
      return
    }

    if (getWindowCount() === 0) {
      createWindow()
    }
  })

  app.on('window-all-closed', () => {
    if (platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    setIsQuitting(true)
    disposeMusicApiRuntime()
    destroyTray()
  })

  app.on('will-quit', () => {
    clearConfiguredGlobalShortcuts()
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node tests/main-lifecycle.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit only task files**

Run:

```powershell
git add -- tests/main-lifecycle.test.ts src/main/app/lifecycle.ts
git commit --only -- tests/main-lifecycle.test.ts src/main/app/lifecycle.ts -m "refactor: extract main app lifecycle"
```

---

### Task 6: Extract Main Window Options And Creation

**Files:**

- Create: `tests/main-window-options.test.ts`
- Create: `src/main/window/main-window.ts`
- Modify: `src/main/window/window-paths.ts`

- [ ] **Step 1: Write the failing options test**

Create `tests/main-window-options.test.ts`:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'

import { createMainWindowOptions } from '../src/main/window/main-window.ts'

test('createMainWindowOptions preserves current Windows window options', () => {
  const options = createMainWindowOptions({
    platform: 'win32',
    preloadPath: 'F:\\app\\out\\preload\\index.cjs',
  })

  assert.equal(options.width, 1280)
  assert.equal(options.height, 760)
  assert.equal(options.minWidth, 1280)
  assert.equal(options.minHeight, 760)
  assert.equal(options.frame, false)
  assert.equal(options.maximizable, false)
  assert.equal(options.titleBarOverlay, false)
  assert.equal(options.autoHideMenuBar, true)
  assert.deepEqual(options.webPreferences, {
    preload: 'F:\\app\\out\\preload\\index.cjs',
    contextIsolation: true,
    nodeIntegration: false,
    devTools: true,
  })
})

test('createMainWindowOptions preserves current non-Windows frame behavior', () => {
  assert.equal(
    createMainWindowOptions({
      platform: 'darwin',
      preloadPath: '/app/out/preload/index.cjs',
    }).frame,
    true
  )
})
```

This test intentionally records the currently active options. Do not re-enable the commented `titleBarStyle` line unless the user explicitly approves a behavior change.

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node tests/main-window-options.test.ts
```

Expected: FAIL with `Cannot find module ... src/main/window/main-window.ts`.

- [ ] **Step 3: Implement `main-window.ts`**

Create `src/main/window/main-window.ts`:

```ts
import type { BrowserWindow, WebContents } from 'electron'

import { getConfig } from '../config/store'
import { bindWindowStateEvents } from '../ipc/window-ipc'
import {
  clearConfiguredGlobalShortcuts,
  syncConfiguredGlobalShortcuts,
} from '../shortcuts/global-shortcuts'
import { WINDOW_IPC_CHANNELS } from './types'
import { resolveWindowCloseBehavior } from './close-behavior'
import { toggleDetachedDevTools } from './devtools'
import { applyWindowTitleBarTheme } from './titlebar-theme'
import { resolvePreloadPath, resolveRendererLoadTarget } from './window-paths'

type BrowserWindowConstructor = new (
  options: Electron.BrowserWindowConstructorOptions
) => BrowserWindow

type CreateMainWindowOptions = {
  platform: NodeJS.Platform
  preloadPath: string
}

type CreateMainWindowDependencies = {
  BrowserWindow: BrowserWindowConstructor
  globalShortcut: {
    register: (accelerator: string, callback: () => void) => boolean
  }
  appIsPackaged: boolean
  envRendererUrl?: string
  mainDirname: string
  platform: NodeJS.Platform
  getIsQuitting: () => boolean
  setMainWindow: (window: BrowserWindow | null) => void
  getMainWindow: () => BrowserWindow | null
  hideMainWindowToTray: () => void
}

export function createMainWindowOptions({
  platform,
  preloadPath,
}: CreateMainWindowOptions): Electron.BrowserWindowConstructorOptions {
  const isWindows = platform === 'win32'

  return {
    width: 1280,
    height: 760,
    minWidth: 1280,
    minHeight: 760,
    frame: !isWindows,
    maximizable: false,
    titleBarOverlay: platform === 'darwin' ? false : isWindows ? false : true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true,
    },
  }
}

export function showMainWindow(window: BrowserWindow | null) {
  if (!window) {
    return
  }

  if (window.isMinimized()) {
    window.restore()
  }

  window.show()
  window.focus()
}

function registerWindowCloseBehavior({
  window,
  getIsQuitting,
  hideMainWindowToTray,
}: {
  window: BrowserWindow
  getIsQuitting: () => boolean
  hideMainWindowToTray: () => void
}) {
  window.on('close', event => {
    const nextBehavior = resolveWindowCloseBehavior({
      isQuitting: getIsQuitting(),
      closeBehavior: getConfig('closeBehavior'),
    })

    if (nextBehavior === 'allow-close') {
      return
    }

    event.preventDefault()

    if (nextBehavior === 'hide-to-tray') {
      hideMainWindowToTray()
      return
    }

    window.webContents.send(WINDOW_IPC_CHANNELS.CLOSE_REQUESTED)
  })
}

function registerDetachedDevToolsShortcut({
  globalShortcut,
  getMainWindow,
}: {
  globalShortcut: CreateMainWindowDependencies['globalShortcut']
  getMainWindow: () => BrowserWindow | null
}) {
  if (process.env.NODE_ENV_ELECTRON_VITE !== 'development') {
    return
  }

  globalShortcut.register('Control+Shift+I', () => {
    const webContents: WebContents | undefined = getMainWindow()?.webContents
    if (!webContents) {
      return
    }

    toggleDetachedDevTools(webContents)
  })
}

export function createMainWindow({
  BrowserWindow,
  globalShortcut,
  appIsPackaged,
  envRendererUrl,
  mainDirname,
  platform,
  getIsQuitting,
  setMainWindow,
  getMainWindow,
  hideMainWindowToTray,
}: CreateMainWindowDependencies) {
  const preloadPath = resolvePreloadPath(mainDirname)
  const window = new BrowserWindow(
    createMainWindowOptions({
      platform,
      preloadPath,
    })
  )

  setMainWindow(window)
  bindWindowStateEvents(window)
  registerWindowCloseBehavior({
    window,
    getIsQuitting,
    hideMainWindowToTray,
  })
  window.setMenu(null)

  const rendererTarget = resolveRendererLoadTarget({
    appIsPackaged,
    mainDirname,
    rendererUrl: envRendererUrl,
  })

  if (rendererTarget.type === 'url') {
    window.loadURL(rendererTarget.value)
  } else {
    window.loadFile(rendererTarget.value)
  }

  registerDetachedDevToolsShortcut({
    globalShortcut,
    getMainWindow,
  })

  applyWindowTitleBarTheme(window)
  syncConfiguredGlobalShortcuts(window)
  window.on('closed', () => {
    clearConfiguredGlobalShortcuts()
    setMainWindow(null)
  })

  return window
}
```

- [ ] **Step 4: Run options test**

Run:

```powershell
node tests/main-window-options.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Run related tests**

Run:

```powershell
node tests/main-window-paths.test.ts
node tests/window-close-behavior.test.ts
node tests/devtools-window.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit only task files**

Run:

```powershell
git add -- tests/main-window-options.test.ts src/main/window/main-window.ts src/main/window/window-paths.ts
git commit --only -- tests/main-window-options.test.ts src/main/window/main-window.ts src/main/window/window-paths.ts -m "refactor: extract main window creation"
```

---

### Task 7: Add Bootstrap Orchestration

**Files:**

- Create: `src/main/app/bootstrap.ts`
- Modify: `src/main/index.ts`

- [ ] **Step 1: Implement `bootstrap.ts` from existing startup order**

Create `src/main/app/bootstrap.ts`:

```ts
import electron from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  bootstrapAuthSession,
  registerAuthRequestHeaderHook,
} from '../auth/store'
import { getConfig } from '../config/store'
import { registerMainIpc } from '../ipc/register-main-ipc'
import { applyMusicApiRuntimeEnv } from '../music-api-runtime'
import { registerLocalMediaProtocol } from '../protocol/local-media'
import { startMusicApi } from '../server'
import {
  clearConfiguredGlobalShortcuts,
  syncConfiguredGlobalShortcuts,
} from '../shortcuts/global-shortcuts'
import { createTrayController } from '../tray/tray-controller'
import {
  syncNativeThemeSource,
  applyWindowTitleBarTheme,
} from '../window/titlebar-theme'
import { registerMainAppLifecycle } from './lifecycle'
import { createMainAppState } from './app-state'
import { registerWindowPermissionHandlers } from '../window/permission'
import { createMainWindow, showMainWindow } from '../window/main-window'
import { TRAY_IPC_CHANNELS } from '../../shared/ipc/tray.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const mainDirname = path.join(__dirname, '..')
const { app, BrowserWindow, globalShortcut, nativeTheme, session } = electron

export function bootstrapMainApp() {
  const state = createMainAppState()

  const hideMainWindowToTray = () => {
    state.getMainWindow()?.hide()
  }

  const trayController = createTrayController({
    showMainWindow: () => {
      showMainWindow(state.getMainWindow())
    },
    quitApp: () => {
      state.setIsQuitting(true)
      app.quit()
    },
    sendCommand: command => {
      state
        .getMainWindow()
        ?.webContents.send(TRAY_IPC_CHANNELS.COMMAND, command)
    },
  })

  const createWindow = () => {
    return createMainWindow({
      BrowserWindow,
      globalShortcut,
      appIsPackaged: app.isPackaged,
      envRendererUrl: process.env.ELECTRON_RENDERER_URL,
      mainDirname,
      platform: process.platform,
      getIsQuitting: state.getIsQuitting,
      setMainWindow: state.setMainWindow,
      getMainWindow: state.getMainWindow,
      hideMainWindowToTray,
    })
  }

  app.whenReady().then(async () => {
    registerMainIpc({
      onShortcutConfigChange: () => {
        syncConfiguredGlobalShortcuts(state.getMainWindow())
      },
      onAutoStartConfigChange: (enabled: boolean) => {
        app.setLoginItemSettings({
          openAtLogin: enabled,
          openAsHidden: false,
          path: app.getPath('exe'),
        })
      },
      trayController,
      onQuitRequested: () => {
        state.setIsQuitting(true)
      },
    })
    registerLocalMediaProtocol()
    registerWindowPermissionHandlers({
      session,
      isAllowedWebContents: webContents =>
        webContents === state.getMainWindow()?.webContents,
    })
    trayController.initialize()

    try {
      const musicApiRuntime = await startMusicApi()
      state.setMusicApiRuntime(musicApiRuntime)
      applyMusicApiRuntimeEnv(musicApiRuntime)
      registerAuthRequestHeaderHook()
      await bootstrapAuthSession()
      syncNativeThemeSource(getConfig('theme'))

      const autoStartEnabled = getConfig('autoStartEnabled')
      app.setLoginItemSettings({
        openAtLogin: autoStartEnabled,
        openAsHidden: false,
        path: app.getPath('exe'),
      })

      createWindow()

      nativeTheme.on('updated', () => {
        const mainWindow = state.getMainWindow()
        if (mainWindow) {
          applyWindowTitleBarTheme(mainWindow)
        }
      })
    } catch (error) {
      console.error('Failed to bootstrap Music API runtime:', error)
      app.quit()
      return
    }
  })

  registerMainAppLifecycle({
    app,
    platform: process.platform,
    getMainWindow: state.getMainWindow,
    getWindowCount: () => BrowserWindow.getAllWindows().length,
    showMainWindow: () => showMainWindow(state.getMainWindow()),
    createWindow,
    setIsQuitting: state.setIsQuitting,
    disposeMusicApiRuntime: () => {
      state.getMusicApiRuntime()?.dispose()
      state.clearMusicApiRuntime()
    },
    destroyTray: () => {
      trayController.destroy()
    },
    clearConfiguredGlobalShortcuts,
  })
}
```

- [ ] **Step 2: Replace `index.ts` with thin entrypoint**

Modify `src/main/index.ts` to:

```ts
import { bootstrapMainApp } from './app/bootstrap'
import { registerLocalMediaScheme } from './protocol/local-media'

registerLocalMediaScheme()
bootstrapMainApp()
```

- [ ] **Step 3: Run focused main-process tests**

Run:

```powershell
node tests/main-window-paths.test.ts
node tests/window-permission.test.ts
node tests/register-main-ipc.test.ts
node tests/main-app-state.test.ts
node tests/main-lifecycle.test.ts
node tests/main-window-options.test.ts
node tests/window-close-behavior.test.ts
node tests/devtools-window.test.ts
```

Expected: all tests pass.

- [ ] **Step 4: Run node typecheck**

Run:

```powershell
pnpm exec tsc -p tsconfig.node.json --noEmit
```

Expected: exit code 0.

- [ ] **Step 5: Commit only task files**

Run:

```powershell
git add -- src/main/app/bootstrap.ts src/main/index.ts
git commit --only -- src/main/app/bootstrap.ts src/main/index.ts -m "refactor: move main process bootstrap orchestration"
```

---

### Task 8: Final Verification

**Files:**

- Verify all files changed by Tasks 1-7.

- [ ] **Step 1: Run all focused tests**

Run:

```powershell
node tests/main-window-paths.test.ts
node tests/window-permission.test.ts
node tests/register-main-ipc.test.ts
node tests/main-app-state.test.ts
node tests/main-lifecycle.test.ts
node tests/main-window-options.test.ts
node tests/window-close-behavior.test.ts
node tests/devtools-window.test.ts
```

Expected: all focused tests pass.

- [ ] **Step 2: Run main-process typecheck**

Run:

```powershell
pnpm exec tsc -p tsconfig.node.json --noEmit
```

Expected: exit code 0.

- [ ] **Step 3: Run lint**

Run:

```powershell
pnpm lint
```

Expected: exit code 0. Existing warnings may remain if they are unrelated to this refactor.

- [ ] **Step 4: Inspect final diff**

Run:

```powershell
git diff -- src/main/index.ts src/main/app src/main/window src/main/ipc/register-main-ipc.ts tests/main-window-paths.test.ts tests/window-permission.test.ts tests/register-main-ipc.test.ts tests/main-app-state.test.ts tests/main-lifecycle.test.ts tests/main-window-options.test.ts
```

Expected: `src/main/index.ts` only imports `bootstrapMainApp` and `registerLocalMediaScheme`, and extracted modules own their intended responsibilities.

- [ ] **Step 5: Report status**

Report:

```text
Implemented main entry modularization.
Focused tests: pass.
Node typecheck: pass.
Lint: pass with existing warnings, or clean if no warnings remain.
```
