import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle, Lock } from 'lucide-react'
import type { CollectToPlaylistCreateFormProps } from '../types'

const COLLECT_PLAYLIST_TITLE_PLACEHOLDER = '\u6b4c\u5355\u6807\u9898'
const COLLECT_PLAYLIST_PRIVATE_LABEL = '\u79c1\u5bc6\u6b4c\u5355'
const COLLECT_PLAYLIST_PRIVATE_VISIBLE_SELF = '\u4ec5\u81ea\u5df1\u53ef\u89c1'
const COLLECT_PLAYLIST_PRIVATE_VISIBLE_PUBLIC = '\u516c\u5f00\u53ef\u89c1'
const COLLECT_PLAYLIST_CREATE_SUBMITTING = '\u521b\u5efa\u4e2d...'
const COLLECT_PLAYLIST_CREATE_ACTION =
  '\u521b\u5efa\u5e76\u6536\u85cf\u5f53\u524d\u6b4c\u66f2'

const CollectToPlaylistCreateForm = ({
  title,
  isPrivate,
  submitting,
  disabled,
  maxLength,
  onTitleChange,
  onPrivateChange,
  onSubmit,
}: CollectToPlaylistCreateFormProps) => {
  return (
    <section className='space-y-4 border-b px-5 py-4'>
      <Input
        autoFocus
        value={title}
        maxLength={maxLength}
        placeholder={COLLECT_PLAYLIST_TITLE_PLACEHOLDER}
        onChange={event => onTitleChange(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onSubmit()
          }
        }}
        className='border-border/70 bg-background h-11 rounded-[18px] px-4'
      />

      <div className='flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3'>
        <div className='flex items-center gap-2 text-sm font-medium'>
          <Lock className='text-muted-foreground size-4' />
          <Label htmlFor='collect-playlist-private'>
            {COLLECT_PLAYLIST_PRIVATE_LABEL}
          </Label>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-xs'>
            {isPrivate
              ? COLLECT_PLAYLIST_PRIVATE_VISIBLE_SELF
              : COLLECT_PLAYLIST_PRIVATE_VISIBLE_PUBLIC}
          </span>
          <Checkbox
            id='collect-playlist-private'
            checked={isPrivate}
            onCheckedChange={checked => onPrivateChange(checked === true)}
          />
        </div>
      </div>

      <Button
        type='button'
        disabled={disabled}
        onClick={onSubmit}
        className='h-11 w-full rounded-[18px] text-sm font-semibold'
      >
        {submitting ? <LoaderCircle className='size-4 animate-spin' /> : null}
        {submitting
          ? COLLECT_PLAYLIST_CREATE_SUBMITTING
          : COLLECT_PLAYLIST_CREATE_ACTION}
      </Button>
    </section>
  )
}

export default CollectToPlaylistCreateForm
