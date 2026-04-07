import { Link } from 'react-router-dom'
import type { SimilarArtistItem } from '@/pages/Artists/artist-detail.model'

interface SimilarArtistsProps {
  artists: SimilarArtistItem[]
}

const SimilarArtists = ({ artists }: SimilarArtistsProps) => {
  return (
    <section className='space-y-5'>
      <h2 className='text-foreground text-3xl font-bold tracking-tight'>
        ���Ƹ���
      </h2>
      {artists.length === 0 ? (
        <div className='border-border/60 bg-card/68 text-muted-foreground rounded-[30px] border px-6 py-10 text-sm'>
          �������Ƹ���
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-5'>
          {artists.map(artist => (
            <Link
              key={artist.id}
              to={`/artists/${artist.id}`}
              className='group border-border/50 bg-card/72 overflow-hidden rounded-[24px] border p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1'
            >
              <img
                src={artist.picUrl}
                alt={artist.name}
                className='aspect-square size-full rounded-[20px] object-cover transition-transform duration-500 group-hover:scale-[1.03]'
                loading='lazy'
                decoding='async'
                draggable={false}
              />
              <div className='mt-4 space-y-1'>
                <h3 className='truncate text-lg font-bold'>{artist.name}</h3>
                <p className='text-muted-foreground text-sm'>
                  {artist.musicSize ?? 0} �׸��� �� {artist.albumSize ?? 0} ��ר��
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default SimilarArtists
