import type {
  DownloadTask,
  DownloadTaskFilterValue,
} from './download-task.types'

export interface DownloadsFilterTabsProps {
  activeFilter: DownloadTaskFilterValue
  onFilterChange: (value: DownloadTaskFilterValue) => void
}

export interface DownloadsPageViewProps {
  activeFilter: DownloadTaskFilterValue
  tasks: DownloadTask[]
  onFilterChange: (value: DownloadTaskFilterValue) => void
  onOpenFile: (taskId: string) => void
  onOpenFolder: (taskId: string) => void
  onRemoveTask: (taskId: string) => void
}

export interface DownloadsTaskListProps {
  tasks: DownloadTask[]
  onOpenFile: (taskId: string) => void
  onOpenFolder: (taskId: string) => void
  onRemoveTask: (taskId: string) => void
}

export interface DownloadTaskRowProps {
  task: DownloadTask
  onOpenFile: (taskId: string) => void
  onOpenFolder: (taskId: string) => void
  onRemoveTask: (taskId: string) => void
}
