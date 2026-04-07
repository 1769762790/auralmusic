import { MoreHorizontal, Play, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ArtistDetailProfile } from '@/pages/Artists/artist-detail.model'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

interface ArtistHeroProps {
  profile: ArtistDetailProfile
  summary: string
}

const ArtistHero = ({ profile, summary }: ArtistHeroProps) => {
  console.log(profile)

  return (
    <section className='grid items-center gap-8 lg:grid-cols-[320px_minmax(0,1fr)]'>
      <div className='border-border/60 bg-card/80 relative h-[250px] w-[250px] overflow-hidden rounded-full border shadow-[0_32px_80px_rgba(15,23,42,0.12)]'>
        <img
          src={profile.coverUrl}
          alt={profile.name}
          className='aspect-[1/1] size-full object-cover'
          loading='eager'
          decoding='async'
          draggable={false}
        />
        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(15,23,42,0.06))]' />
      </div>

      <div className='mt-2 flex min-w-0 flex-col justify-center gap-5 py-4'>
        <div className='space-y-2'>
          <h1 className='text-foreground text-5xl font-black tracking-tight'>
            {profile.name}
          </h1>
          <p className='text-muted-foreground mt-5 text-lg'>
            {profile.identity} · {profile.musicSize}首歌2 · {profile.albumSize}
            张专辑 ·{profile.mvSize}个MV
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <p className='text-muted-foreground line-clamp-3 text-lg leading-9'>
                {summary}
              </p>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <p className='overflow-y-auto text-[16px]'>{summary}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className='flex flex-wrap gap-4 pt-2'>
          <Button
            type='button'
            size='lg'
            className='h-14 rounded-full px-8 text-base font-semibold'
          >
            <Play className='size-4 fill-current' />
            播放
          </Button>
          <Button
            type='button'
            size='lg'
            variant='secondary'
            className='h-14 rounded-full px-8 text-base font-semibold'
          >
            <UserPlus className='size-4' />
            关注
          </Button>
          <Button
            type='button'
            size='icon-lg'
            variant='secondary'
            className='w-[100px] rounded-full py-7'
          >
            <MoreHorizontal className='size-5' />
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ArtistHero
