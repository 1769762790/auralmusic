import { Play } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { LibraryPlaylistItem } from '../library.model'

interface LibraryPlaylistCardProps {
  playlist: LibraryPlaylistItem
  onOpen: (id: number) => void
}

const LibraryPlaylistCard = ({
  playlist,
  onOpen,
}: LibraryPlaylistCardProps) => {
  return (
    <article
      className='group cursor-pointer'
      onClick={() => onOpen(playlist.id)}
    >
      <div className='relative overflow-hidden rounded-[22px] bg-neutral-100 shadow-[0_20px_46px_rgba(15,23,42,0.08)]'>
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className='aspect-square size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]'
            loading='lazy'
            decoding='async'
            draggable={false}
          />
        ) : (
          <div className='from-muted via-muted/80 to-muted/60 aspect-square size-full bg-gradient-to-br' />
        )}

        <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(15,23,42,0.06))]' />
        <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <Button
            type='button'
            size='icon'
            className='size-12 rounded-full border border-white/20 bg-white/18 text-white backdrop-blur-md hover:bg-white/24'
            onClick={event => {
              event.stopPropagation()
              onOpen(playlist.id)
            }}
          >
            <Play className='ml-0.5 size-4 fill-current' />
          </Button>
        </div>
      </div>

      <div className='mt-3 space-y-1'>
        <h3 className='truncate text-[1.05rem] font-bold text-neutral-950'>
          {playlist.name}
        </h3>
        <p className='truncate text-sm text-neutral-500'>{playlist.subtitle}</p>
      </div>
    </article>
  )
}

export default LibraryPlaylistCard
