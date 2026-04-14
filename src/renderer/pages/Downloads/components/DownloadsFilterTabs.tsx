import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DOWNLOAD_TASK_FILTERS } from '../downloads.model'
import type { DownloadTaskFilterValue } from '../downloads.types'

interface DownloadsFilterTabsProps {
  activeFilter: DownloadTaskFilterValue
  onFilterChange: (value: DownloadTaskFilterValue) => void
}

const DownloadsFilterTabs = ({
  activeFilter,
  onFilterChange,
}: DownloadsFilterTabsProps) => {
  return (
    <Tabs
      value={activeFilter}
      onValueChange={value => onFilterChange(value as DownloadTaskFilterValue)}
      className='gap-4'
    >
      <TabsList
        variant='line'
        className='h-11 rounded-full border border-white/10 bg-white/40 px-2 backdrop-blur-md'
      >
        {DOWNLOAD_TASK_FILTERS.map(filter => (
          <TabsTrigger
            key={filter.value}
            value={filter.value}
            className='rounded-full px-4'
          >
            {filter.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default DownloadsFilterTabs
