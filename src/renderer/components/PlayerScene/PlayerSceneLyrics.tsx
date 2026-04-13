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
      className='no-scrollbar max-h-[72vh] overflow-y-auto py-[28vh] pr-16 2xl:max-h-[81vh]'
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%)',
      }}
    >
      <div className='space-y-8'>
        {lines.map((line, index) => {
          const isActive = index === activeIndex

          return (
            <div
              key={`${line.time}-${index}`}
              ref={node => {
                lineRefs.current[index] = node
              }}
              className={cn(
                'text-md opacity-50 md:text-2xl 2xl:text-3xl',
                'leading-[1.45] 2xl:leading-loose',
                'font-extrabold tracking-tight',
                'flex min-h-[1.5em] items-center',
                'pr-10 pl-8 md:pr-19 md:pl-10',
                'origin-left',
                'transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
                'will-change-opacity will-change-color will-change-transform',
                isActive
                  ? 'scale-[1.3] font-black tracking-normal text-(--player-foreground) opacity-100'
                  : 'scale-100 font-extrabold tracking-tight text-(--player-soft)'
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
