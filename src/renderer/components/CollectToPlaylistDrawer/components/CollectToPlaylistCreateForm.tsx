import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle, Lock } from 'lucide-react'

interface CollectToPlaylistCreateFormProps {
  title: string
  isPrivate: boolean
  submitting: boolean
  disabled: boolean
  maxLength: number
  onTitleChange: (value: string) => void
  onPrivateChange: (checked: boolean) => void
  onSubmit: () => void
}

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
        placeholder='歌单标题'
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
          <Label htmlFor='collect-playlist-private'>隐私歌单</Label>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-xs'>
            {isPrivate ? '仅自己可见' : '公开可见'}
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
        {submitting ? '创建中...' : '创建并收藏当前歌曲'}
      </Button>
    </section>
  )
}

export default CollectToPlaylistCreateForm
