type ToggleableDevToolsWebContents = {
  isDevToolsOpened: () => boolean
  closeDevTools: () => void
  openDevTools: (options: { mode: 'detach'; activate: boolean }) => void
}

export function toggleDetachedDevTools(
  webContents: ToggleableDevToolsWebContents
) {
  if (webContents.isDevToolsOpened()) {
    webContents.closeDevTools()
    return
  }

  webContents.openDevTools({
    mode: 'detach',
    activate: true,
  })
}
