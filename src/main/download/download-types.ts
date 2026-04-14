import type {
  AudioQualityLevel,
  DownloadFileNamePattern,
} from '../config/types.ts'

export const DOWNLOAD_QUALITY_FALLBACK_CHAIN = [
  'jymaster',
  'dolby',
  'sky',
  'jyeffect',
  'hires',
  'lossless',
  'exhigh',
  'higher',
  'standard',
] as const satisfies readonly AudioQualityLevel[]

export type DownloadTaskStatus =
  | 'queued'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'skipped'

export type DownloadTaskMetadata = {
  albumName?: string
  coverUrl?: string
  lyric?: string
  translatedLyric?: string
}

export type SongDownloadPayload = {
  songId: number | string
  songName: string
  artistName: string
  coverUrl?: string
  albumName?: string
  directory?: string
  fileName?: string
  requestedQuality: AudioQualityLevel
  sourceUrl?: string
  metadata?: DownloadTaskMetadata
}

export type DownloadTask = {
  id: string
  songId: number | string
  songName: string
  artistName: string
  coverUrl: string
  albumName: string | null
  requestedQuality: AudioQualityLevel
  resolvedQuality: AudioQualityLevel | null
  status: DownloadTaskStatus
  progress: number
  errorMessage: string | null
  targetPath: string
  note: string | null
  warningMessage: string | null
  createdAt: number
  updatedAt: number
  completedAt: number | null
}

export type ResolveSongUrlInput = {
  taskId: string
  payload: SongDownloadPayload
  quality: AudioQualityLevel
  songId: number | string
}

export type ResolvedSongDownload = {
  url: string
  quality?: AudioQualityLevel
  fileExtension?: string | null
}

export type DownloadRuntimeConfig = {
  downloadDir: string
  downloadQuality: AudioQualityLevel
  downloadSkipExisting: boolean
  downloadConcurrency: number
  downloadFileNamePattern: DownloadFileNamePattern
  downloadEmbedCover: boolean
  downloadEmbedLyrics: boolean
  downloadEmbedTranslatedLyrics: boolean
}

export function createDownloadQualityFallbackChain(
  requestedQuality: AudioQualityLevel
) {
  const startIndex = DOWNLOAD_QUALITY_FALLBACK_CHAIN.indexOf(requestedQuality)

  if (startIndex < 0) {
    return ['standard'] as AudioQualityLevel[]
  }

  return DOWNLOAD_QUALITY_FALLBACK_CHAIN.slice(
    startIndex
  ) as AudioQualityLevel[]
}

export const DOWNLOAD_IPC_CHANNELS = {
  GET_DEFAULT_DIRECTORY: 'download:get-default-directory',
  SELECT_DIRECTORY: 'download:select-directory',
  OPEN_DIRECTORY: 'download:open-directory',
  ENQUEUE_SONG_DOWNLOAD: 'download:enqueue-song-download',
  GET_TASKS: 'download:get-tasks',
  REMOVE_TASK: 'download:remove-task',
  OPEN_DOWNLOADED_FILE: 'download:open-downloaded-file',
  OPEN_DOWNLOADED_FILE_FOLDER: 'download:open-downloaded-file-folder',
  TASKS_CHANGED: 'download:tasks-changed',
} as const
