import { ReactElement } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { CopyPlusIcon, Heart, PlaySquareIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MusicContextMenuProps {
  name: string | undefined
  artistName: string | undefined
  coverUrl: string | undefined
  likeStatus: boolean
  children: ReactElement
  onPlayClick: () => void
  onToggleClick: () => void
}
const MusicContextMenu = ({
  children,
  onPlayClick,
  onToggleClick,
  coverUrl,
  artistName,
  name,
  likeStatus,
}: MusicContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className='w-52.5'>
        <ContextMenuItem>
          <div className='flex w-full items-center justify-between'>
            <img
              src={coverUrl}
              className='mr-4 h-10 w-10 shrink-0 rounded-[12px] shadow-md'
            />
            <div className='min-w-0 flex-1'>
              <div className='text-md truncate'>{name}</div>
              <div className='text-primary/50 truncate'>{artistName}</div>
            </div>
          </div>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onPlayClick}>
          <PlaySquareIcon size='4' />
          播放
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onToggleClick?.()}>
          <Heart
            className={cn(
              'size-4 transition-colors',
              likeStatus ? 'fill-current text-red-500' : 'text-neutral-700'
            )}
          />
          {likeStatus ? '取消喜欢' : '喜欢'}
        </ContextMenuItem>
        <ContextMenuItem onClick={onPlayClick}>
          <CopyPlusIcon size='4' />
          收藏到歌单
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default MusicContextMenu
