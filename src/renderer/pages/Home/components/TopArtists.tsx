import { memo } from 'react'
import { Autoplay, Virtual } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.css'
import type { ArtistSummary } from '../home.type'
import { TopArtistsSkeleton } from './HomeSkeletons'

interface ArtistCardProps {
  artist: ArtistSummary
}

interface TopArtistsProps {
  list?: ArtistSummary[]
  isLoading?: boolean
}

const ArtistCard = memo(({ artist }: ArtistCardProps) => (
  <div
    className='flex flex-col items-center text-center'
    onClick={() => console.log(artist)}
  >
    <div className='border-border/50 size-[150px] overflow-hidden rounded-full border'>
      <img
        src={artist.picUrl}
        alt={artist.name}
        loading='lazy'
        decoding='async'
        draggable={false}
        className='hover: hover:shadow-black/20d size-full object-cover transition-all duration-300 hover:scale-125 hover:shadow-xl'
      />
    </div>
    <p className='mt-3 truncate text-sm font-medium'>{artist.name}</p>
  </div>
))

const TopArtists = ({ list = [], isLoading = false }: TopArtistsProps) => {
  return (
    <div className='mt-10'>
      <h3 className='mb-10 text-2xl font-semibold'>热门歌手</h3>
      {isLoading ? (
        <TopArtistsSkeleton />
      ) : (
        <Swiper
          allowTouchMove={false}
          simulateTouch={false}
          draggable={false}
          modules={[Virtual, Autoplay]}
          slidesPerView={6}
          spaceBetween={10}
          virtual
          loop
          className='w-full'
          autoplay={{
            delay: 2500,
            pauseOnMouseEnter: true,
            disableOnInteraction: false,
          }}
          speed={500}
          breakpoints={{
            0: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 6 },
            1480: { slidesPerView: 6 },
            1740: { slidesPerView: 8 },
            2160: { slidesPerView: 10 },
          }}
        >
          {list.map((artist, index) => (
            <SwiperSlide key={artist.id} virtualIndex={index}>
              <ArtistCard artist={artist} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  )
}

export default memo(TopArtists)
