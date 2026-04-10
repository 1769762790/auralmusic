import type { LibraryRankingItem } from '../library.model'
import LibraryRankingRow from './LibraryRankingRow'

interface LibraryRankingPanelProps {
  rankings: LibraryRankingItem[]
  loading?: boolean
}

const LibraryRankingPanel = ({
  rankings,
  loading = false,
}: LibraryRankingPanelProps) => {
  if (!loading && rankings.length === 0) {
    return (
      <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
        暂无听歌排行内容
      </div>
    )
  }

  return (
    <section className='space-y-4'>
      <div className='text-muted-foreground text-sm'>
        基于官方榜单展示最近热门歌曲。
      </div>
      <div className='border-border/40 bg-background/70 overflow-hidden rounded-[24px] border'>
        {rankings.map(item => (
          <LibraryRankingRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default LibraryRankingPanel
