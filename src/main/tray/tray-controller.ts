import electron from 'electron'

import type { PlaybackMode } from '../../shared/playback.ts'
import type { TrayCommand, TrayState } from '../../shared/tray.ts'

type TrayLike = {
  setToolTip: (toolTip: string) => void
  setContextMenu: (menu: unknown) => void
  on: (event: 'click' | 'double-click', listener: () => void) => void
  destroy: () => void
}

type MenuLike = {
  buildFromTemplate: (template: unknown[]) => unknown
}

type NativeImageLike = {
  setTemplateImage?: (template: boolean) => void
}

type TrayConstructor = new (image: unknown) => TrayLike

type TrayControllerOptions = {
  Tray?: TrayConstructor
  Menu?: MenuLike
  nativeImage?: {
    createFromDataURL: (dataUrl: string) => NativeImageLike
  }
  platform?: NodeJS.Platform
  showMainWindow: () => void
  quitApp: () => void
  sendCommand: (command: TrayCommand) => void
}

const DEFAULT_TRAY_STATE: TrayState = {
  currentTrackName: '',
  currentArtistNames: '',
  status: 'idle',
  playbackMode: 'repeat-all',
  hasCurrentTrack: false,
}

function getTrayIcon(
  nativeImage: TrayControllerOptions['nativeImage'],
  platform: NodeJS.Platform
) {
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="16" fill="#111111"/>
      <path d="M18 36c3.5-7 7.5-11 14-11s10.5 4 14 11" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="24" cy="40" r="4" fill="#ffffff"/>
      <circle cx="32" cy="27" r="4" fill="#ffffff"/>
      <circle cx="40" cy="40" r="4" fill="#ffffff"/>
    </svg>
  `

  const image = nativeImage?.createFromDataURL(
    `data:image/svg+xml;base64,${Buffer.from(iconSvg).toString('base64')}`
  )

  if (platform === 'darwin') {
    image?.setTemplateImage?.(true)
  }

  return image
}

function formatNowPlayingLabel(state: TrayState) {
  const title = state.currentTrackName.trim()
  const artist = state.currentArtistNames.trim()

  if (!title) {
    return 'AuralMusic'
  }

  return artist ? `${title} - ${artist}` : title
}

function createPlaybackModeItem(
  label: string,
  playbackMode: PlaybackMode,
  currentMode: PlaybackMode,
  sendCommand: (command: TrayCommand) => void
) {
  return {
    label,
    type: 'radio',
    checked: currentMode === playbackMode,
    click: () => {
      sendCommand({
        type: 'set-playback-mode',
        playbackMode,
      })
    },
  }
}

function buildTrayMenuTemplate(
  state: TrayState,
  options: Pick<
    TrayControllerOptions,
    'showMainWindow' | 'quitApp' | 'sendCommand'
  >
) {
  const hasCurrentTrack = state.hasCurrentTrack
  const isPlaying = state.status === 'playing' || state.status === 'loading'

  return [
    {
      label: formatNowPlayingLabel(state),
      enabled: false,
    },
    { type: 'separator' },
    {
      label: isPlaying ? '暂停' : '播放',
      enabled: hasCurrentTrack,
      click: () => {
        options.sendCommand({ type: 'toggle-play' })
      },
    },
    {
      label: '上一首',
      enabled: hasCurrentTrack,
      click: () => {
        options.sendCommand({ type: 'play-previous' })
      },
    },
    {
      label: '下一首',
      enabled: hasCurrentTrack,
      click: () => {
        options.sendCommand({ type: 'play-next' })
      },
    },
    { type: 'separator' },
    {
      label: '单曲循环',
      submenu: [
        createPlaybackModeItem(
          '列表循环',
          'repeat-all',
          state.playbackMode,
          options.sendCommand
        ),
        createPlaybackModeItem(
          '随机播放',
          'shuffle',
          state.playbackMode,
          options.sendCommand
        ),
        createPlaybackModeItem(
          '单曲循环',
          'repeat-one',
          state.playbackMode,
          options.sendCommand
        ),
      ],
    },
    { type: 'separator' },
    {
      label: '设置',
      click: () => {
        options.showMainWindow()
        options.sendCommand({ type: 'open-settings' })
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        options.quitApp()
      },
    },
  ]
}

export function createTrayController(options: TrayControllerOptions) {
  const Tray = options.Tray ?? (electron.Tray as TrayConstructor)
  const Menu = options.Menu ?? electron.Menu
  const nativeImage = options.nativeImage ?? electron.nativeImage
  const platform = options.platform ?? process.platform

  let tray: TrayLike | null = null
  let state = DEFAULT_TRAY_STATE

  const refreshMenu = () => {
    if (!tray) {
      return
    }

    tray.setContextMenu(
      Menu.buildFromTemplate(buildTrayMenuTemplate(state, options))
    )
  }

  return {
    initialize() {
      if (tray) {
        return tray
      }

      tray = new Tray(getTrayIcon(nativeImage, platform))
      tray.setToolTip('AuralMusic')
      refreshMenu()
      tray.on('click', () => {
        options.showMainWindow()
      })
      tray.on('double-click', () => {
        options.showMainWindow()
      })

      return tray
    },
    setState(nextState: TrayState) {
      state = nextState
      refreshMenu()
    },
    destroy() {
      tray?.destroy()
      tray = null
    },
  }
}
