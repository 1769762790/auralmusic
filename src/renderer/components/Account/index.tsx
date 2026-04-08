import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, LogIn, Moon, QrCode, Settings2, Sun } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

const getAvatarFallback = (nickname: string | null) => {
  if (!nickname?.trim()) {
    return '云'
  }

  const compact = nickname.trim()
  return compact.slice(0, 1).toUpperCase()
}

const AccountControl = ({
  currentTheme,
  onOpenDownloads,
  onToggleTheme,
  onOpenSettings,
}: {
  currentTheme: string
  onOpenDownloads: () => void
  onToggleTheme: () => void
  onOpenSettings: () => void
}) => {
  // const { user, isLoading, menuOpen, setMenuOpen, dialogOpen, setDialogOpen, applyAuthenticatedUser } = useOnlineAccount();
  const user = {}
  const isLoading = false
  const [menuOpen, setMenuOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const fallbackText = useMemo(
    () => getAvatarFallback(user?.nickname ?? null),
    [user?.nickname]
  )

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const openMenu = () => {
    clearCloseTimer()
    setMenuOpen(true)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setMenuOpen(false)
      closeTimerRef.current = null
    }, 120)
  }

  const isDark = useMemo(() => {
    return currentTheme === 'dark'
  }, [currentTheme])
  useEffect(() => () => clearCloseTimer(), [])

  return (
    <>
      <DropdownMenu modal={false} open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            aria-label={
              user
                ? `Online account: ${user.nickname}`
                : 'Open online account menu'
            }
            className='border-border bg-background/70 hover:bg-accent/40 flex size-10 items-center justify-center rounded-full border transition-colors'
            onClick={() => setMenuOpen(current => !current)}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <Avatar className='size-9 border-none'>
              <AvatarImage
                alt={user?.nickname ?? 'Online account'}
                src={user?.avatarUrl ?? undefined}
              />
              <AvatarFallback
                className={cn(
                  'text-[11px] font-bold',
                  !user &&
                    'bg-gradient-to-br from-sky-400/90 via-indigo-400/80 to-violet-400/90'
                )}
              >
                {fallbackText}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className='w-[280px] rounded-[24px] p-3'
          onCloseAutoFocus={event => event.preventDefault()}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className='border-border/70 bg-background/65 flex items-center gap-3 rounded-[18px] border p-3'>
            <Avatar className='border-border/60 size-12'>
              <AvatarImage
                alt={user?.nickname ?? 'Online account'}
                src={user?.avatarUrl ?? undefined}
              />
              <AvatarFallback className='text-sm font-bold'>
                {fallbackText}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='text-foreground truncate text-sm font-semibold'>
                {user?.nickname ??
                  (isLoading ? '正在读取账号信息...' : '未登录网易云音乐')}
              </p>
              {!user && (
                <p className='text-muted-foreground truncate text-xs'>
                  登录后可同步喜欢的音乐与每日推荐
                </p>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className='rounded-[18px] px-3 py-3'
            onSelect={event => {
              event.preventDefault()
              onToggleTheme()
            }}
          >
            {isDark ? <Sun className='size-4' /> : <Moon className='size-4' />}
            <div className='flex flex-col'>
              <span className='font-semibold' onClick={onToggleTheme}>
                {isDark ? '切换到浅色模式' : '切换到深色模式'}
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className='rounded-[18px] px-3 py-3'
            onSelect={event => {
              event.preventDefault()
              setMenuOpen(false)
              onOpenDownloads()
            }}
          >
            <Download className='size-4' />
            <div className='flex flex-col'>
              <span className='font-semibold'>下载</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className='rounded-[18px] px-3 py-3'
            onSelect={event => {
              event.preventDefault()
              setMenuOpen(false)
              onOpenSettings()
            }}
          >
            <Settings2 className='size-4' />
            <div className='flex flex-col'>
              <span className='font-semibold'>设置</span>
            </div>
          </DropdownMenuItem>

          {user.userId && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='rounded-[18px] px-3 py-3'
                onSelect={event => {
                  event.preventDefault()
                  setMenuOpen(false)
                  // setDialogOpen(true)
                }}
              >
                <LogIn className='size-4' />
                <div className='flex flex-col'>
                  <span className='font-semibold'>退出登录</span>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <OnlineLoginDialog open={dialogOpen} onOpenChange={setDialogOpen} onAuthorized={applyAuthenticatedUser} /> */}
    </>
  )
}

export default AccountControl
