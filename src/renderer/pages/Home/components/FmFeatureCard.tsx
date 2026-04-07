import { Button } from '@/components/ui/button'
import { Pause, Play, SkipForward, ThumbsDown } from 'lucide-react'

interface FmFeatureCardProps {
  coverUrl?: string
  title?: string
  artist?: string
  isLoading?: boolean
  moveToNext?: () => void
  trashCurrent?: () => void
}

const FmFeatureCard = ({
  coverUrl,
  title,
  artist,
  isLoading,
  moveToNext,
  trashCurrent,
}: FmFeatureCardProps) => {
  const isPlayingFm = false
  const isActiveFm = false
  return (
    <section
      className='group border-border/70 relative h-[200px] overflow-hidden rounded-[26px] border p-4 shadow-[0_24px_64px_rgba(0,0,0,0.14)]'
      // style={{
      //   backgroundImage: `
      //     radial-gradient(circle at 82% 22%, ${coverTheme.glowPrimary} 0%, transparent 28%),
      //     radial-gradient(circle at 16% 86%, ${coverTheme.glowSecondary} 0%, transparent 24%),
      //     linear-gradient(135deg, ${coverTheme.primary} 0%, ${coverTheme.secondary} 100%)
      //   `,
      // }}
    >
      {coverUrl ? (
        <div
          className='pointer-events-none absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-3xl'
          style={{ backgroundImage: `url("${coverUrl}")` }}
        />
      ) : null}
      <div
        className='pointer-events-none absolute inset-0'
        // style={{
        //   backgroundImage: `
        //     linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 36%),
        //     linear-gradient(135deg, ${coverTheme.overlay} 0%, rgba(0,0,0,0) 68%)
        //   `,
        // }}
      />

      <div className='relative z-10 flex h-full gap-5'>
        <div className='relative h-[164px] w-[164px] shrink-0 overflow-hidden rounded-[18px] bg-black/18'>
          {isLoading ? (
            <div className='h-full w-full animate-pulse bg-white/10' />
          ) : null}
          {!isLoading && coverUrl ? (
            <img
              src={coverUrl}
              alt={title ?? 'Personal FM cover'}
              className='h-full w-full object-cover'
            />
          ) : null}
          {!isLoading && !coverUrl ? (
            <div className='h-full w-full bg-[linear-gradient(135deg,rgba(42,15,48,0.86),rgba(107,42,95,0.72),rgba(245,112,190,0.42))]' />
          ) : null}
        </div>

        <div className='flex min-w-0 flex-1 flex-col justify-between py-1 text-white'>
          <div className='space-y-2'>
            <div className='space-y-1'>
              <h3 className='truncate text-[clamp(1.8rem,2.8vw,2.6rem)] font-black text-white'>
                {title ?? '私人 FM'}
              </h3>
              <p className='text-lg font-semibold text-white/80'>
                {artist ?? '根据你的听歌偏好生成'}
              </p>
            </div>
          </div>

          <div className='flex items-end justify-between gap-4'>
            <div className='flex items-center gap-2 text-white'>
              <Button
                type='button'
                size='icon'
                variant='ghost'
                className='size-10 rounded-full bg-transparent text-white/90 hover:bg-white/12 hover:text-white disabled:opacity-50'
                disabled={isLoading}
                onClick={() => {
                  trashCurrent?.()
                }}
              >
                <ThumbsDown className='size-4' />
              </Button>
              <Button
                type='button'
                size='icon'
                className='size-12 rounded-full border border-white/12 text-white backdrop-blur-md transition-all disabled:opacity-50 data-[state=active]:border-white/22 data-[state=active]:bg-white/24 data-[state=active]:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.16)]'
                data-state={isActiveFm ? 'active' : 'idle'}
                disabled={isLoading}
                onClick={() => {
                  if (isActiveFm) {
                    // togglePlay()
                    return
                  }

                  // playFromCursor()
                }}
              >
                {isPlayingFm ? (
                  <Pause className='size-5 fill-current' />
                ) : (
                  <Play className='ml-0.5 size-5 fill-current' />
                )}
              </Button>
              <Button
                type='button'
                size='icon'
                variant='ghost'
                className='size-10 rounded-full bg-transparent text-white/90 hover:bg-white/12 hover:text-white disabled:opacity-50'
                disabled={isLoading}
                onClick={() => {
                  moveToNext?.()
                }}
              >
                <SkipForward className='size-4' />
              </Button>
            </div>

            <span className='rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-white/72 uppercase'>
              私人 FM
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FmFeatureCard
