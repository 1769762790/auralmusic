const DownloadsEmptyState = () => {
  return (
    <div className='flex min-h-64 flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/40 px-6 text-center backdrop-blur-md'>
      <p className='text-foreground text-base font-semibold'>暂无下载任务</p>
      <p className='text-muted-foreground mt-2 text-sm'>
        当前筛选条件下还没有可展示的下载记录。
      </p>
    </div>
  )
}

export default DownloadsEmptyState
