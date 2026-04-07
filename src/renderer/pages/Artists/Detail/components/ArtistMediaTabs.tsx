import { Clapperboard, Disc3, PlayCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  formatArtistPublishDate,
  type ArtistAlbumItem,
  type ArtistMvItem,
} from '@/pages/Artists/artist-detail.model'

interface ArtistMediaTabsProps {
  albums: ArtistAlbumItem[]
  mvs: ArtistMvItem[]
}

function formatPlayCount(playCount?: number) {
  if (!playCount) return '���޲���'
  return new Intl.NumberFormat('zh-CN').format(playCount)
}

const ArtistMediaTabs = ({ albums, mvs }: ArtistMediaTabsProps) => {
  return (
    <section className='space-y-5'>
      <Tabs defaultValue='albums' className='gap-5'>
        <div className='flex items-center gap-5'>
          <TabsList
            variant='line'
            className='border-border/60 bg-card/70 h-11 rounded-full border px-2'
          >
            <TabsTrigger
              value='albums'
              className='data-active:bg-background rounded-full px-4 text-2xl font-bold data-active:shadow-[0_10px_26px_rgba(15,23,42,0.08)]'
            >
              专辑
            </TabsTrigger>
            <TabsTrigger
              value='mvs'
              className='data-active:bg-background rounded-full px-4 text-2xl font-bold data-active:shadow-[0_10px_26px_rgba(15,23,42,0.08)]'
            >
              MV
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='albums'>
          {albums.length === 0 ? (
            <div className='border-border/60 bg-card/68 text-muted-foreground rounded-[30px] border px-6 py-10 text-sm'>
              专辑
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4'>
              {albums.map(album => (
                <article
                  key={album.id}
                  className='border-border/50 bg-card/72 overflow-hidden rounded-[24px] border p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)]'
                >
                  <div className='relative overflow-hidden rounded-[20px]'>
                    <img
                      src={album.picUrl}
                      alt={album.name}
                      className='aspect-square size-full object-cover'
                      loading='lazy'
                      decoding='async'
                      draggable={false}
                    />
                  </div>
                  <div className='mt-4 space-y-1.5'>
                    <h3 className='truncate text-lg font-bold'>{album.name}</h3>
                    <p className='text-muted-foreground text-sm'>
                      {formatArtistPublishDate(album.publishTime)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='mvs'>
          {mvs.length === 0 ? (
            <div className='border-border/60 bg-card/68 text-muted-foreground rounded-[30px] border px-6 py-10 text-sm'>
              MV
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4'>
              {mvs.map(mv => (
                <article
                  key={mv.id}
                  className='border-border/50 bg-card/72 flex gap-4 rounded-[24px] border p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)]'
                >
                  <div className='relative min-w-0 flex-1 overflow-hidden rounded-[20px]'>
                    <img
                      src={mv.coverUrl}
                      alt={mv.name}
                      className='aspect-[16/9] size-full object-cover'
                      loading='lazy'
                      decoding='async'
                      draggable={false}
                    />
                    <div className='absolute inset-0 flex items-center justify-center bg-black/12'>
                      <PlayCircle className='size-12 text-white/90' />
                    </div>
                  </div>
                  <div className='flex min-w-0 basis-[38%] flex-col justify-center gap-2'>
                    <h3 className='truncate text-xl font-bold'>{mv.name}</h3>
                    <p className='text-muted-foreground text-sm'>
                      {formatArtistPublishDate(mv.publishTime)}
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      播放次数 {formatPlayCount(mv.playCount)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}

export default ArtistMediaTabs
