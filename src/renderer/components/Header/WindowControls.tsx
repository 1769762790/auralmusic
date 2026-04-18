import { Copy, Minus, Square, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getElectronWindowApi } from '@/lib/electron-runtime'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/stores/config-store'

import CloseWindowDialog from '../CloseWindowDialog'
import { shouldShowCloseWindowDialog } from '../CloseWindowDialog/close-window.model'
import type { WindowControlsProps } from './types'

const WindowControls = ({ className = '' }: WindowControlsProps) => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const closeBehavior = useConfigStore(state => state.config.closeBehavior)
  const electronWindow = getElectronWindowApi()

  useEffect(() => {
    if (!electronWindow) {
      return
    }

    let isMounted = true

    void electronWindow.isMaximized().then(value => {
      if (isMounted) {
        setIsMaximized(value)
      }
    })

    const unsubscribe = electronWindow.onMaximizeChange(value => {
      setIsMaximized(value)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [electronWindow])

  useEffect(() => {
    if (!electronWindow) {
      return
    }

    const unsubscribe = electronWindow.onCloseRequested(() => {
      setIsOpen(true)
    })

    return unsubscribe
  }, [electronWindow])

  const maximizeLabel = useMemo(
    () => (isMaximized ? '还原窗口' : '最大化窗口'),
    [isMaximized]
  )

  const handleClose = () => {
    if (shouldShowCloseWindowDialog(closeBehavior)) {
      setIsOpen(true)
      return
    }

    if (closeBehavior === 'minimize') {
      handleMiniWindow()
      return
    }

    handleCloseWindow()
  }

  const handleCloseWindow = () => {
    void electronWindow?.quitApp()
  }

  const handleMiniWindow = () => {
    void electronWindow?.hideToTray()
  }

  if (!electronWindow) {
    return null
  }

  return (
    <div className={cn('window-no-drag flex items-stretch', className)}>
      <button
        type='button'
        aria-label='最小化窗口'
        className='hover:bg-foreground/8 flex h-13 w-13 items-center justify-center rounded-[15px] transition-colors'
        onClick={() => void electronWindow.minimize()}
      >
        <Minus className='size-4' />
      </button>
      <button
        type='button'
        aria-label={maximizeLabel}
        className='hover:bg-foreground/8 flex h-13 w-13 items-center justify-center rounded-[15px] transition-colors'
        onClick={() => void electronWindow.toggleMaximize()}
      >
        {isMaximized ? (
          <Copy className='size-3.5 rotate-180' />
        ) : (
          <Square className='size-3.5' />
        )}
      </button>
      <button
        type='button'
        aria-label='关闭窗口'
        className='hover:bg-foreground/8 flex h-13 w-13 items-center justify-center rounded-[15px] transition-colors'
        onClick={handleClose}
      >
        <X className='size-4' />
      </button>

      <CloseWindowDialog
        open={isOpen}
        setOpen={setIsOpen}
        handleCloseWindow={handleCloseWindow}
        handleMiniWindow={handleMiniWindow}
      />
    </div>
  )
}

export default WindowControls
