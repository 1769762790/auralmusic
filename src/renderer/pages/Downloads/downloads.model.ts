import type {
  DownloadTask,
  DownloadTaskFilterOption,
  DownloadTaskFilterValue,
  DownloadTaskStatus,
  DownloadTaskViewModel,
} from './downloads.types'

export const DOWNLOAD_TASK_FILTER_LABELS = {
  all: '所有任务',
  active: '队列中',
  failed: '下载失败',
  skipped: '已跳过',
  completed: '下载完成',
} as const

export const DOWNLOAD_TASK_STATUS_LABELS: Record<DownloadTaskStatus, string> = {
  queued: '队列中',
  downloading: '下载中',
  failed: '下载失败',
  skipped: '已跳过',
  completed: '下载完成',
}

export const DOWNLOAD_TASK_FILTERS: DownloadTaskFilterOption[] = [
  { value: 'all', label: DOWNLOAD_TASK_FILTER_LABELS.all },
  { value: 'active', label: DOWNLOAD_TASK_FILTER_LABELS.active },
  { value: 'failed', label: DOWNLOAD_TASK_FILTER_LABELS.failed },
  { value: 'skipped', label: DOWNLOAD_TASK_FILTER_LABELS.skipped },
  { value: 'completed', label: DOWNLOAD_TASK_FILTER_LABELS.completed },
]

export function getDownloadTaskStatusLabel(status: DownloadTaskStatus) {
  return DOWNLOAD_TASK_STATUS_LABELS[status]
}

export function filterDownloadTasks(
  tasks: DownloadTask[],
  filter: DownloadTaskFilterValue
) {
  if (filter === 'all') {
    return tasks
  }

  if (filter === 'active') {
    return tasks.filter(
      task => task.status === 'queued' || task.status === 'downloading'
    )
  }

  return tasks.filter(task => task.status === filter)
}

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) {
    return 0
  }

  return Math.min(100, Math.max(0, progress))
}

export function formatDownloadTaskProgress(task: DownloadTask) {
  if (task.status === 'queued') {
    return '等待中'
  }

  return `${Math.round(clampProgress(task.progress))}%`
}

export function canOpenDownloadTaskFile(task: DownloadTask) {
  return task.status === 'completed'
}

export function canOpenDownloadTaskFolder(task: DownloadTask) {
  return (
    task.status === 'completed' ||
    task.status === 'skipped' ||
    task.status === 'failed'
  )
}

export function buildDownloadTaskViewModels(
  tasks: DownloadTask[]
): DownloadTaskViewModel[] {
  return tasks.map(task => ({
    taskId: task.taskId,
    songName: task.songName,
    statusLabel: getDownloadTaskStatusLabel(task.status),
    progressLabel: formatDownloadTaskProgress(task),
    qualityLabel: task.quality || '-',
    canOpenFile: canOpenDownloadTaskFile(task),
    canOpenFolder: canOpenDownloadTaskFolder(task),
    canRemove: true,
  }))
}
