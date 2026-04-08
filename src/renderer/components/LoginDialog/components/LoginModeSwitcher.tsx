import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { LOGIN_MODE_OPTIONS } from '../login-dialog.model'

const LoginModeSwitcher = () => {
  const currentMode = useAuthStore(state => state.loginMode)
  const setLoginMode = useAuthStore(state => state.setLoginMode)

  return (
    <div className='bg-primary/4 grid grid-cols-4 gap-1 rounded-[18px] p-1'>
      {LOGIN_MODE_OPTIONS.map(option => {
        const Icon = option.icon
        const active = currentMode === option.value

        return (
          <button
            key={option.value}
            type='button'
            className={cn(
              'flex items-center justify-center gap-2 rounded-[14px] px-3 py-3 text-sm font-medium transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setLoginMode(option.value)}
          >
            <Icon className='size-4' />
            <span className='sm:hidden'>{option.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}

export default LoginModeSwitcher
