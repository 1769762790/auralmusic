import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ArtistFilterOption } from '@/pages/Artists/artists.model'

interface ArtistFilterGroupProps<T> {
  label: string
  options: ArtistFilterOption<T>[]
  value: T
  onChange: (value: T) => void
  compact?: boolean
}

const ArtistFilterGroup = <T,>({
  label,
  options,
  value,
  onChange,
  compact = false,
}: ArtistFilterGroupProps<T>) => {
  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-start'>
      <div className='text-muted-foreground min-w-16 pt-1 text-[16px] font-medium tracking-[0.24em] uppercase'>
        {label}
      </div>
      <div className={cn('flex flex-wrap gap-2.5', compact && 'max-w-4xl')}>
        {options.map(option => {
          const isActive = option.value === value

          return (
            <Button
              key={String(option.value)}
              type='button'
              variant='ghost'
              size='sm'
              className={cn(
                'text-foreground/78 hover:bg-primary/10 hover:text-foreground rounded-full px-4 text-base font-medium transition-all',
                compact && 'min-w-10 px-0',
                isActive &&
                  'bg-primary/10 text-primary hover:bg-primary/10 shadow-[0_12px_30px_rgba(99,102,241,0.12)]'
              )}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default ArtistFilterGroup
