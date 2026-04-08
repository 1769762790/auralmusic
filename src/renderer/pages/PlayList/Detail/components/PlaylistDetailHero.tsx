import { Heart, MoreHorizontal, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  formatPlaylistUpdateDate,
  type PlaylistDetailHeroData,
} from '../playlist-detail.model'

interface PlaylistDetailHeroProps {
  hero: PlaylistDetailHeroData
}

const PlaylistDetailHero = ({ hero }: PlaylistDetailHeroProps) => {
  return (
    <section className='grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start'>
      <div className='border-border/60 bg-card/80 relative aspect-square overflow-hidden rounded-[28px] border shadow-[0_28px_80px_rgba(15,23,42,0.14)]'>
        {hero.coverUrl ? (
          <img
            src={hero.coverUrl}
            alt={hero.name}
            className='size-full object-cover'
            loading='eager'
            decoding='async'
            draggable={false}
          />
        ) : (
          <div className='from-muted to-muted/70 text-muted-foreground flex size-full items-center justify-center bg-gradient-to-br text-5xl font-black tracking-[-0.08em]'>
            PL
          </div>
        )}
        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(15,23,42,0.08))]' />
      </div>

      <div className='flex h-full flex-col justify-between gap-6'>
        <div className='space-y-4'>
          <h1 className='text-foreground text text-4xl leading-[1] font-black'>
            {hero.name}
          </h1>
          <div className='text-muted-foreground space-y-1 text-lg'>
            <p>Playlist by {hero.creatorName}</p>
            <p>
              最近更新于 {formatPlaylistUpdateDate(hero.updateTime)} ·{' '}
              {hero.trackCount}
              首歌
            </p>
          </div>
          <p className='text-muted-foreground line-clamp-3 max-w-[70ch] text-[15px] leading-8'>
            {hero.description || '暂无歌单简介'}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-4'>
          <Button
            type='button'
            size='lg'
            className='h-14 cursor-pointer rounded-full px-8 text-base font-semibold'
          >
            <Play className='size-4 fill-current' />
            播放
          </Button>
          <Heart className='size-7 cursor-pointer' />

          <MoreHorizontal className='size-7 cursor-pointer' />
        </div>
      </div>
    </section>
  )
}

export default PlaylistDetailHero
