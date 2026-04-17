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
