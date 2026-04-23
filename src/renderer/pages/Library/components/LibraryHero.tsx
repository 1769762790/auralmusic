import { memo } from 'react'

import { Play } from 'lucide-react'

import LibraryQuickSongList from './LibraryQuickSongList'
import type { LibraryHeroProps } from '../types'

const LibraryHero = ({
  songs,
  songCount,
  coverImgUrl: _coverImgUrl,
  likedSongsPreviewRefreshing = false,
  onOpenLikedSongs,
  onPlayLikedSongs,
  onSongLikeChangeSuccess,
}: LibraryHeroProps) => {
  return (
    <section className='space-y-6'>
      <div className='grid grid-cols-[1fr_2fr] gap-5'>
        <div
          role='button'
          tabIndex={0}
          aria-label='打开我喜欢的音乐详情页'
          className='group border-border/70 bg-card/75 focus-visible:ring-primary/35 relative min-h-[240px] cursor-pointer overflow-hidden rounded-[32px] border p-6 text-left shadow-[0_24px_70px_rgba(15,23,42,0.1)] transition-[transform,box-shadow] outline-none hover:-translate-y-0.5 hover:shadow-[0_30px_84px_rgba(15,23,42,0.13)] focus-visible:ring-2 focus-visible:outline-none'
          onClick={onOpenLikedSongs}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpenLikedSongs()
            }
          }}
        >
          {_coverImgUrl ? (
            <>
              <div
                className='absolute inset-0 scale-110 bg-cover bg-center opacity-56 blur-md'
                style={{
                  backgroundImage: `url("${_coverImgUrl}")`,
                }}
              />
              <div className='absolute inset-0 bg-[linear-gradient(138deg,rgba(250,252,255,0.84)_0%,rgba(243,248,255,0.76)_48%,rgba(224,235,255,0.86)_100%)] dark:bg-[linear-gradient(138deg,rgba(15,23,42,0.46)_0%,rgba(15,23,42,0.3)_48%,rgba(15,23,42,0.52)_100%)]' />
            </>
          ) : (
            <div className='absolute inset-0 bg-[linear-gradient(138deg,#eff5ff_0%,#deebff_48%,#ccdcff_100%)] dark:bg-[linear-gradient(138deg,rgba(30,41,59,0.92)_0%,rgba(51,65,85,0.85)_100%)]' />
          )}

          <div className='absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.48),transparent_36%),radial-gradient(circle_at_18%_80%,rgba(255,255,255,0.34),transparent_32%)] dark:bg-[radial-gradient(circle_at_78%_22%,rgba(148,163,184,0.22),transparent_36%),radial-gradient(circle_at_18%_80%,rgba(100,116,139,0.18),transparent_32%)]' />
          <div className='absolute inset-0 bg-white/34 backdrop-blur-[3px] dark:bg-black/18' />

          <div className='relative z-10 flex h-full flex-col justify-between'>
            <div className='space-y-2'>
              <p className='text-foreground/72 text-sm leading-6'>
                收藏过的歌都在这里
              </p>
            </div>

            <div className='flex items-end justify-between gap-4'>
              <div>
                <h2 className='text-foreground text-3xl tracking-[-0.05em]'>
                  我喜欢的音乐
                </h2>
                <p className='text-foreground/78 mt-1 text-sm font-medium'>
                  {songCount} 首
                </p>
              </div>

              <button
                type='button'
                aria-label='播放我喜欢的音乐'
                className='bg-primary text-primary-foreground ring-primary/20 hover:bg-primary/90 flex size-12 items-center justify-center rounded-full shadow-[0_14px_36px_rgba(37,99,235,0.3)] ring-1 transition-[transform,box-shadow,background-color] group-hover:scale-105 group-focus-visible:ring-2'
                onClick={event => {
                  event.stopPropagation()
                  onPlayLikedSongs()
                }}
              >
                <Play className='ml-0.5 size-5 fill-current' />
              </button>
            </div>
          </div>
        </div>

        <LibraryQuickSongList
          songs={songs}
          refreshing={likedSongsPreviewRefreshing}
          onSongLikeChangeSuccess={onSongLikeChangeSuccess}
        />
      </div>
    </section>
  )
}

export default memo(LibraryHero)
