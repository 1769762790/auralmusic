import { Link } from 'react-router-dom'
import type { AlbumSummary } from '../home.type'
import { NewAlbumSkeleton } from './HomeSkeletons'
import AlbumCard from './AlbumCard'

interface NewAlbumListProps {
  list?: AlbumSummary[]
  isLoading?: boolean
}

const NewAlbumList = ({ list = [], isLoading = false }: NewAlbumListProps) => {
  return (
    <div className='mt-10'>
      <div className='group mb-10 flex items-center justify-between'>
        <div className='text-2xl font-semibold'>新专速递</div>
        <Link to='/playlist' className='hover:font-bold'>
          更多
        </Link>
      </div>

      {isLoading ? (
        <NewAlbumSkeleton />
      ) : (
        <div className='grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-8 2xl:grid-cols-6 2xl:gap-8'>
          {list.map(item => (
            <AlbumCard
              coverUrl={item.picUrl}
              title={item.name}
              artist={item.artist.name}
              key={item.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NewAlbumList
