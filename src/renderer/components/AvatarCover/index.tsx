import { cn } from '@/lib/utils'
import { useState } from 'react'

type AvatarCoverProps = {
  url: string
  rounded?: 'full' | string
  className?: string
  shadowClassName?: string
  onClickCover?: () => void
}

const AvatarCover = ({
  url,
  rounded = '15px',
  className,
  onClickCover,
  shadowClassName,
}: AvatarCoverProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className='relative cursor-pointer'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClickCover}
    >
      <img
        src={url}
        className={cn(
          rounded === 'full' ? 'rounded-full' : `rounded-[${rounded}]`,
          'h-full w-full object-cover transition-all duration-300',
          className
        )}
      />

      <div
        className={cn(
          'absolute top-2 left-2 z-[-1] aspect-square w-full scale-[0.9] object-cover opacity-0 blur-lg transition-all duration-300',
          rounded === 'full' ? 'rounded-full' : `rounded-[${rounded}]`,
          isHovered && 'opacity-100',
          shadowClassName
        )}
        style={{ background: `url(${url})` }}
      ></div>
    </div>
  )
}

export default AvatarCover
