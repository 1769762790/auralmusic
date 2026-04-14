export const MUSIC_CONTEXT_MENU_LABELS = {
  download: '下载',
} as const

export function getMusicContextMenuDownloadHandler(onDownload?: () => void) {
  return onDownload
}

export function shouldShowMusicContextMenuDownload(onDownload?: () => void) {
  return typeof onDownload === 'function'
}
