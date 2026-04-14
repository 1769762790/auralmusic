import DownloadsFilterTabs from './DownloadsFilterTabs'
import DownloadsTaskList from './DownloadsTaskList'
import type { DownloadTask, DownloadTaskFilterValue } from '../downloads.types'

interface DownloadsPageViewProps {
  activeFilter: DownloadTaskFilterValue
  tasks: DownloadTask[]
  onFilterChange: (value: DownloadTaskFilterValue) => void
  onOpenFile: (taskId: string) => void
  onOpenFolder: (taskId: string) => void
  onRemoveTask: (taskId: string) => void
}

const DownloadsPageView = ({
  activeFilter,
  tasks,
  onFilterChange,
  onOpenFile,
  onOpenFolder,
  onRemoveTask,
}: DownloadsPageViewProps) => {
  return (
    <section className='w-full max-w-6xl space-y-6'>
      <header className='relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(12,26,24,0.92),rgba(21,74,63,0.78),rgba(240,185,78,0.18))] px-6 py-7 text-white shadow-[0_24px_80px_rgba(8,20,18,0.22)]'>
        <div className='absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_68%)]' />
        <div className='relative space-y-2'>
          <p className='text-xs font-semibold tracking-[0.3em] text-white/70 uppercase'>
            Downloads
          </p>
          <h1 className='text-3xl font-semibold text-white'>下载管理</h1>
          <p className='max-w-2xl text-sm text-white/75'>
            集中查看全部下载任务，按状态筛选，并管理本地文件入口。
          </p>
        </div>
      </header>

      <div className='rounded-[28px] border border-white/10 bg-white/55 p-5 shadow-sm backdrop-blur-md'>
        <DownloadsFilterTabs
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
      </div>

      <DownloadsTaskList
        tasks={tasks}
        onOpenFile={onOpenFile}
        onOpenFolder={onOpenFolder}
        onRemoveTask={onRemoveTask}
      />
    </section>
  )
}

export default DownloadsPageView
