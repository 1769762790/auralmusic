import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface AlbumCardProps {
  coverUrl?: string
  title?: string
  artist?: string
}

const AlbumCard = ({ coverUrl, title, artist }: AlbumCardProps) => {
  return (
    <div className='group w-full'>
      <div
        className='flex aspect-square cursor-pointer items-center justify-center rounded-2xl bg-cover bg-center shadow-xl transition-transform duration-500 hover:translate-[-5px] hover:shadow-2xl'
        style={{ backgroundImage: `url("${coverUrl}")` }}
      >
        <Button
          type='button'
          size='icon'
          className='size-12 cursor-pointer rounded-full border border-white/10 bg-white/12 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-[1.04] hover:bg-white/18 disabled:cursor-default disabled:opacity-45'
          onClick={event => {
            event.stopPropagation()
            // onPlay?.()
          }}
        >
          <Play className='ml-0.5 size-4 fill-current' />
        </Button>
      </div>
      <div className='mt-2 truncate font-bold'>{title}</div>
      <div>{artist}</div>
    </div>
  )
}

export default AlbumCard
