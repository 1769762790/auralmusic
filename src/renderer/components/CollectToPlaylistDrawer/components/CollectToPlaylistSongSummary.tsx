import AvatarCover from '@/components/AvatarCover'
import { Button } from '@/components/ui/button'
import { imageSizes, resizeImageUrl } from '@/lib/image-url'
import { Music4, Plus, Sparkles } from 'lucide-react'
import type { CollectToPlaylistSongSummaryProps } from '../types'

const COLLECT_PLAYLIST_CURRENT_SONG = '\u5f53\u524d\u6b4c\u66f2'
const COLLECT_PLAYLIST_UNKNOWN_ARTIST = '\u672a\u77e5\u6b4c\u624b'
const COLLECT_PLAYLIST_CANCEL_CREATE = '\u53d6\u6d88\u521b\u5efa'
const COLLECT_PLAYLIST_CREATE_NEW = '\u521b\u5efa\u65b0\u6b4c\u5355'

const CollectToPlaylistSongSummary = ({
  song,
  createExpanded,
  onToggleCreate,
}: CollectToPlaylistSongSummaryProps) => {
  return (
    <section className='space-y-4 border-b px-5 pt-5 pb-4'>
      <div className='bg-primary/4 border-border/60 flex items-center gap-3 rounded-[24px] border p-3'>
        {song.coverUrl ? (
          <AvatarCover
            url={resizeImageUrl(
              song.coverUrl,
              imageSizes.listCover.width,
              imageSizes.listCover.height
            )}
            className='size-16 shrink-0'
            wrapperClass='shrink-0'
            rounded='18px'
          />
        ) : (
          <div className='bg-primary/10 text-primary flex size-16 shrink-0 items-center justify-center rounded-[18px]'>
            <Music4 className='size-7' />
          </div>
        )}

        <div className='min-w-0 flex-1'>
          <p className='text-muted-foreground text-xs font-medium tracking-[0.12em]'>
            {COLLECT_PLAYLIST_CURRENT_SONG}
          </p>
          <h3 className='truncate text-base font-semibold'>{song.songName}</h3>
          <p className='text-muted-foreground truncate text-sm'>
            {song.artistName || COLLECT_PLAYLIST_UNKNOWN_ARTIST}
          </p>
        </div>
      </div>

      <Button
        type='button'
        variant={createExpanded ? 'secondary' : 'outline'}
        onClick={onToggleCreate}
        className='h-11 w-full justify-start rounded-[18px] px-4 text-sm font-semibold'
      >
        {createExpanded ? (
          <Sparkles className='mr-2 size-4' />
        ) : (
          <Plus className='mr-2 size-4' />
        )}
        {createExpanded
          ? COLLECT_PLAYLIST_CANCEL_CREATE
          : COLLECT_PLAYLIST_CREATE_NEW}
      </Button>
    </section>
  )
}

export default CollectToPlaylistSongSummary
