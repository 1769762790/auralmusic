import { Clapperboard, Disc3 } from 'lucide-react'
import {
  formatArtistPublishDate,
  type ArtistLatestReleaseData,
} from '@/pages/Artists/artist-detail.model'

interface ArtistLatestReleaseProps {
  latestRelease: ArtistLatestReleaseData
}

const ArtistLatestRelease = ({ latestRelease }: ArtistLatestReleaseProps) => {
  return (
    <section className='space-y-5'>
      <h2 className='text-foreground text-3xl font-bold tracking-tight'>
        最新发布
      </h2>
      <div className='grid grid-cols-2 gap-10 sm:grid-cols-1 md:grid-cols-2'>
        <article className='border-border/60 bg-card/72 flex min-h-44 gap-5 rounded-[30px] border p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)]'>
          {latestRelease.album ? (
            <>
              <img
                src={latestRelease.album.picUrl}
                alt={latestRelease.album.name}
                className='size-32 rounded-[26px] object-cover'
                loading='lazy'
                decoding='async'
                draggable={false}
              />
              <div className='flex min-w-0 flex-col justify-center gap-2'>
                <h3 className='truncate text-2xl font-bold'>
                  {latestRelease.album.name}
                </h3>
                <p className='text-muted-foreground text-sm'>
                  {formatArtistPublishDate(latestRelease.album.publishTime)}
                </p>
                <p className='text-muted-foreground text-sm'>
                  Album · {latestRelease.album.size ?? 0}首歌
                </p>
              </div>
            </>
          ) : (
            <div className='text-muted-foreground flex min-h-32 items-center text-sm'>
              暂无数据
            </div>
          )}
        </article>

        <article className='border-border/60 bg-card/72 flex min-h-44 gap-5 rounded-[30px] border p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)]'>
          {latestRelease.mv ? (
            <>
              <img
                src={latestRelease.mv.coverUrl}
                alt={latestRelease.mv.name}
                className='aspect-[16/9] w-52 rounded-[26px] object-cover'
                loading='lazy'
                decoding='async'
                draggable={false}
              />
              <div className='flex min-w-0 flex-col justify-center gap-2'>
                <h3 className='truncate text-2xl font-bold'>
                  {latestRelease.mv.name}
                </h3>
                <p className='text-muted-foreground text-sm'>
                  {formatArtistPublishDate(latestRelease.mv.publishTime)}
                </p>
                <p className='text-muted-foreground text-sm'>最新MV</p>
              </div>
            </>
          ) : (
            <div className='text-muted-foreground flex min-h-32 items-center text-sm'>
              暂无数据
            </div>
          )}
        </article>
      </div>
    </section>
  )
}

export default ArtistLatestRelease
