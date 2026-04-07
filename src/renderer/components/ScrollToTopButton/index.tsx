import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScrollToTopButtonProps {
  threshold?: number
  className?: string
}

const ScrollToTopButton = ({
  threshold = 200,
  className,
}: ScrollToTopButtonProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type='button'
      aria-label='Scroll to top'
      onClick={handleClick}
      className={cn(
        'bg-primary shadow-primary/20 hover:bg-primary/90 focus:ring-primary/50 fixed z-50 inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg hover:-translate-y-0.5 focus:ring-2 focus:outline-none',
        // ✅ 核心动画：位移 + 透明度 双过渡
        'right-[5px] transition-all duration-500 ease-out',
        // ✅ 显示状态：正常位置 + 完全可见
        visible ? 'bottom-4 opacity-100' : 'bottom-[-20px] opacity-0',
        className
      )}
    >
      <ArrowUp className='size-5' />
    </button>
  )
}

export default ScrollToTopButton
