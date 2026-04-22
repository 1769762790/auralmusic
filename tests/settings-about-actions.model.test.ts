import assert from 'node:assert/strict'
import test from 'node:test'

import type { AppUpdateSnapshot } from '../src/shared/update.ts'
import { handleAboutCheckForUpdates } from '../src/renderer/pages/Settings/components/about-settings.model.ts'

function createSnapshot(
  overrides: Partial<AppUpdateSnapshot> = {}
): AppUpdateSnapshot {
  return {
    status: 'idle',
    currentVersion: '1.1.0',
    latestVersion: null,
    releaseNotes: '',
    releaseDate: null,
    releaseUrl: null,
    actionMode: 'install',
    downloadProgress: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    errorMessage: null,
    lastCheckedAt: null,
    lastTrigger: null,
    ...overrides,
  }
}

test('handleAboutCheckForUpdates refreshes release notes even when an update is already available', async () => {
  const calls: string[] = []
  const refreshedSnapshot = createSnapshot({
    status: 'update-available',
    latestVersion: '1.2.0',
    releaseNotes: 'updated release notes',
  })

  const nextSnapshot = await handleAboutCheckForUpdates({
    snapshot: createSnapshot({
      status: 'update-available',
      latestVersion: '1.2.0',
      releaseNotes: 'stale release notes',
    }),
    checkForUpdates: async () => {
      calls.push('check')
      return refreshedSnapshot
    },
    openUpdateModal: () => {
      calls.push('open')
    },
    showUpToDateMessage: () => {
      calls.push('up-to-date')
    },
    showErrorMessage: () => {
      calls.push('error')
    },
  })

  assert.equal(nextSnapshot, refreshedSnapshot)
  assert.deepEqual(calls, ['check', 'open'])
})

test('handleAboutCheckForUpdates keeps the modal shortcut while an update is downloading', async () => {
  const calls: string[] = []
  const currentSnapshot = createSnapshot({ status: 'downloading' })

  const nextSnapshot = await handleAboutCheckForUpdates({
    snapshot: currentSnapshot,
    checkForUpdates: async () => {
      calls.push('check')
      return createSnapshot({ status: 'downloading' })
    },
    openUpdateModal: () => {
      calls.push('open')
    },
    showUpToDateMessage: () => {
      calls.push('up-to-date')
    },
    showErrorMessage: () => {
      calls.push('error')
    },
  })

  assert.equal(nextSnapshot, currentSnapshot)
  assert.deepEqual(calls, ['open'])
})

test('handleAboutCheckForUpdates shows the up-to-date hint after a fresh successful check', async () => {
  const calls: string[] = []
  const refreshedSnapshot = createSnapshot({
    status: 'up-to-date',
    latestVersion: '1.1.0',
  })

  const nextSnapshot = await handleAboutCheckForUpdates({
    snapshot: createSnapshot(),
    checkForUpdates: async () => {
      calls.push('check')
      return refreshedSnapshot
    },
    openUpdateModal: () => {
      calls.push('open')
    },
    showUpToDateMessage: () => {
      calls.push('up-to-date')
    },
    showErrorMessage: () => {
      calls.push('error')
    },
  })

  assert.equal(nextSnapshot, refreshedSnapshot)
  assert.deepEqual(calls, ['check', 'up-to-date'])
})
