import { Play } from 'lucide-react'
import { Button } from '../ui/button'

const CoverCard = ({ data = {}, onPlay }) => {
  const { coverImgUrl, count, name, id } = data
  return (
    <div className=''>
      <div
        className='group flex aspect-square cursor-pointer items-center justify-center rounded-[15px] bg-cover bg-center bg-no-repeat shadow-md transition-shadow duration-300 group-hover:shadow-md group-hover:shadow-black/20'
        style={{
          backgroundImage: `url(${coverImgUrl})`,
        }}
      >
        <div className='relative inset-0 h-full w-full rounded-[15px] bg-black/0 transition-all duration-300 group-hover:bg-black/30'>
          <Button
            type='button'
            size='icon'
            className='absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18 bg-white/12 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100'
            onClick={() => onPlay && onPlay(id)}
          >
            <Play className='ml-0.5 size-4 fill-current' />
          </Button>
        </div>
      </div>
      <div>{count}</div>
      <div className='mt-2 text-sm font-bold'>{name}</div>
    </div>
  )
}

export default CoverCard
