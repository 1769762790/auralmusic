import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import type { LyricLine } from './player-lyrics.model'

type PlayerSceneLyricsProps = {
  lines: LyricLine[]
  activeIndex: number
  loading: boolean
  error: string
}

const PlayerSceneLyrics = ({
  lines,
  activeIndex,
  loading,
  error,
}: PlayerSceneLyricsProps) => {
  const lineRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    if (activeIndex < 0) {
      return
    }

    lineRefs.current[activeIndex]?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    })
  }, [activeIndex])

  if (loading) {
    return (
      <section className='flex min-h-[460px] items-center justify-center text-(--player-soft)'>
        歌词加载中...
      </section>
    )
  }

  if (error || !lines.length) {
    return (
      <section className='flex min-h-[460px] items-center justify-center text-(--player-soft)'>
        {error || '暂无歌词'}
      </section>
    )
  }

  return (
    <section
      className='no-scrollbar max-h-[72vh] overflow-y-auto py-[28vh] pr-6 2xl:max-h-[81vh]'
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)',
      }}
    >
      <div className='space-y-9'>
        {lines.map((line, index) => {
          const isActive = index === activeIndex

          return (
            <div
              key={`${line.time}-${index}`}
              ref={node => {
                lineRefs.current[index] = node
              }}
              className={cn(
                'tracking-tight transition-all duration-300 ease-in-out',
                isActive
                  ? 'text-[1.3rem] leading-[1.62] font-black text-(--player-foreground) opacity-100 md:text-[2.8rem] 2xl:text-[3.55rem] 2xl:leading-[1.6]'
                  : 'text-md leading-[1.45] font-extrabold text-(--player-soft) opacity-35 md:text-3xl 2xl:text-3xl 2xl:leading-loose'
              )}
            >
              {line.text}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PlayerSceneLyrics
