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
