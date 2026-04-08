import { Ellipsis, Heart, Music4 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  formatMvDuration,
  formatMvPublishDate,
  type MvDetailHeroData,
} from '../../mv-detail.model'

interface MvDetailHeaderProps {
  hero: MvDetailHeroData
}

function formatPlayCount(playCount: number) {
  return new Intl.NumberFormat('zh-CN').format(playCount)
}

const MvDetailHeader = ({ hero }: MvDetailHeaderProps) => {
  return (
    <section className='space-y-5'>
      <div className='flex flex-wrap items-start justify-between gap-5'>
        <div className='space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase shadow-[0_8px_24px_rgba(14,165,233,0.12)] backdrop-blur'>
            <Music4 className='size-3.5' />
            MV
          </div>
          <h1 className='text-foreground text-3xl font-bold'>{hero.name}</h1>
          <div className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'>
            <span className='text-foreground font-medium'>
              {hero.artistName}
            </span>
            <span>发布于 {formatMvPublishDate(hero.publishTime)}</span>
            <span>{formatPlayCount(hero.playCount)} 次播放</span>
            <span>{formatMvDuration(hero.duration)}</span>
          </div>
        </div>

        <div className='flex items-center gap-2 pt-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            className='rounded-full bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur'
            aria-label='喜欢'
          >
            <Heart className='size-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            className='rounded-full bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur'
            aria-label='更多操作'
          >
            <Ellipsis className='size-4' />
          </Button>
        </div>
      </div>

      <p className='text-muted-foreground text-[15px] leading-8'>
        {hero.description || '暂无 MV 简介'}
      </p>
    </section>
  )
}

export default MvDetailHeader
