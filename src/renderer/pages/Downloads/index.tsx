import { useEffect, useMemo, useState } from 'react'
import DownloadsPageView from './components/DownloadsPageView'
import { filterDownloadTasks } from './downloads.model'
import type { DownloadTaskFilterValue } from './downloads.types'
import { useDownloadTaskStore } from '@/stores/download-task-store'

const Downloads = () => {
  const [activeFilter, setActiveFilter] =
    useState<DownloadTaskFilterValue>('all')
  const tasks = useDownloadTaskStore(state => state.tasks)
  const startSubscription = useDownloadTaskStore(
    state => state.startSubscription
  )
  const stopSubscription = useDownloadTaskStore(state => state.stopSubscription)

  useEffect(() => {
    void startSubscription()

    return () => {
      stopSubscription()
    }
  }, [startSubscription, stopSubscription])

  const visibleTasks = useMemo(
    () => filterDownloadTasks(tasks, activeFilter),
    [activeFilter, tasks]
  )

  return (
    <DownloadsPageView
      activeFilter={activeFilter}
      tasks={visibleTasks}
      onFilterChange={setActiveFilter}
      onOpenFile={taskId => {
        void window.electronDownload.openDownloadedFile(taskId)
      }}
      onOpenFolder={taskId => {
        void window.electronDownload.openDownloadedFileFolder(taskId)
      }}
      onRemoveTask={taskId => {
        void window.electronDownload.removeTask(taskId)
      }}
    />
  )
}

export default Downloads
