import DownloadTaskRow from './DownloadTaskRow'
import DownloadsEmptyState from './DownloadsEmptyState'
import type { DownloadTask } from '../downloads.types'

interface DownloadsTaskListProps {
  tasks: DownloadTask[]
  onOpenFile: (taskId: string) => void
  onOpenFolder: (taskId: string) => void
  onRemoveTask: (taskId: string) => void
}

const DownloadsTaskList = ({
  tasks,
  onOpenFile,
  onOpenFolder,
  onRemoveTask,
}: DownloadsTaskListProps) => {
  if (tasks.length === 0) {
    return <DownloadsEmptyState />
  }

  return (
    <div className='space-y-3'>
      {tasks.map(task => (
        <DownloadTaskRow
          key={task.taskId}
          task={task}
          onOpenFile={onOpenFile}
          onOpenFolder={onOpenFolder}
          onRemoveTask={onRemoveTask}
        />
      ))}
    </div>
  )
}

export default DownloadsTaskList
