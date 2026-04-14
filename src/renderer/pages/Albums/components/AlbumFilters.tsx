import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AlbumArea, AlbumFilterOption } from '@/pages/Albums/albums.model'

interface AlbumFiltersProps {
  options: AlbumFilterOption<AlbumArea>[]
  value: AlbumArea
  onChange: (value: AlbumArea) => void
}

const AlbumFilters = ({ options, value, onChange }: AlbumFiltersProps) => {
  return (
    <div className='flex flex-wrap gap-3'>
      {options.map(option => {
        const isActive = option.value === value

        return (
          <Button
            key={option.value}
            type='button'
            variant='ghost'
            className={cn(
              'text-foreground/78 hover:bg-foreground! hover:text-background h-11 cursor-pointer rounded-full border border-transparent px-5 text-base font-medium shadow-md transition-all hover:-translate-y-0.5',
              isActive ? 'bg-foreground text-background shadow-2xl' : ''
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}

export default AlbumFilters
