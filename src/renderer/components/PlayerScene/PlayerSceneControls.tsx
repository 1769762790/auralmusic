import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PlayerSceneControlsProps = {
  disabled: boolean
  isPlaying: boolean
  onPrevious: () => void
  onTogglePlay: () => void
  onNext: () => void
}

type SceneControlButtonProps = {
  label: string
  disabled?: boolean
  variant?: 'default' | 'primary'
  children: ReactNode
  onClick: () => void
}

const SceneControlButton = ({
  label,
  disabled,
  variant = 'default',
  children,
  onClick,
}: SceneControlButtonProps) => {
  return (
    <button
      type='button'
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center justify-center rounded-full transition-all duration-200',
        variant === 'primary'
          ? 'text-primary-foreground bg-primary hover:bg-primary/90 size-15 shadow-[0_22px_48px_rgba(0,0,0,0.28)] hover:scale-105'
          : 'text-primary/72 hover:bg-primary/12 hover:text-primary size-13',
        disabled &&
          'cursor-not-allowed opacity-45 hover:scale-100 hover:bg-transparent'
      )}
    >
      {children}
    </button>
  )
}

const PlayerSceneControls = ({
  disabled,
  isPlaying,
  onPrevious,
  onTogglePlay,
  onNext,
}: PlayerSceneControlsProps) => {
  return (
    <div className='flex items-center justify-center gap-5'>
      <SceneControlButton
        label='上一首'
        disabled={disabled}
        onClick={onPrevious}
      >
        <SkipBack className='size-6 fill-current' />
      </SceneControlButton>

      <SceneControlButton
        label={isPlaying ? '暂停' : '播放'}
        disabled={disabled}
        variant='primary'
        onClick={onTogglePlay}
      >
        {isPlaying ? (
          <Pause className='size-6 fill-current' />
        ) : (
          <Play className='ml-1 size-6 fill-current' />
        )}
      </SceneControlButton>

      <SceneControlButton label='下一首' disabled={disabled} onClick={onNext}>
        <SkipForward className='size-6 fill-current' />
      </SceneControlButton>
    </div>
  )
}

export default PlayerSceneControls
