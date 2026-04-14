export type DownloadTaskStatus =
  | 'queued'
  | 'downloading'
  | 'failed'
  | 'skipped'
  | 'completed'

export interface DownloadTask {
  taskId: string
  songName: string
  status: DownloadTaskStatus
  progress: number
  quality: string
}

export type DownloadTaskFilterValue =
  | 'all'
  | 'active'
  | 'failed'
  | 'skipped'
  | 'completed'

export interface DownloadTaskFilterOption {
  value: DownloadTaskFilterValue
  label: string
}

export interface DownloadTaskViewModel {
  taskId: string
  songName: string
  statusLabel: string
  progressLabel: string
  qualityLabel: string
  canOpenFile: boolean
  canOpenFolder: boolean
  canRemove: boolean
}
