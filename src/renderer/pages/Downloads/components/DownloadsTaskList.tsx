import DownloadTaskRow from './DownloadTaskRow'
import DownloadsEmptyState from './DownloadsEmptyState'
import type { DownloadsTaskListProps } from '../types'

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
