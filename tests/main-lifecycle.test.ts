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

test('registerMainAppLifecycle can defer activate window creation until startup is ready', () => {
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
    canCreateWindowOnActivate: () => false,
    setIsQuitting: () => calls.push('set-quitting'),
    disposeMusicApiRuntime: () => calls.push('dispose-runtime'),
    destroyTray: () => calls.push('destroy-tray'),
    clearConfiguredGlobalShortcuts: () => calls.push('clear-shortcuts'),
  })

  handlers.get('activate')?.()

  assert.deepEqual(calls, [])
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
