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
