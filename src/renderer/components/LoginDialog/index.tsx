import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/auth-store'
import LoginArtwork from './components/LoginArtwork'
import LoginForm from './components/LoginForm'
import LoginModeSwitcher from './components/LoginModeSwitcher'
import { useMemo } from 'react'
import { LOGIN_MODE_OPTIONS } from './login-dialog.model'

const LoginDialog = () => {
  const open = useAuthStore(state => state.dialogOpen)
  const loginMode = useAuthStore(state => state.loginMode)
  const openLoginDialog = useAuthStore(state => state.openLoginDialog)
  const closeLoginDialog = useAuthStore(state => state.closeLoginDialog)

  console.log('loginMode', loginMode)

  const currentModeLabel = useMemo(() => {
    return LOGIN_MODE_OPTIONS.filter(item => item.value == loginMode)[0].label
  }, [loginMode])

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen =>
        nextOpen ? openLoginDialog(loginMode) : closeLoginDialog()
      }
    >
      <DialogContent
        className='w-[min(980px,calc(100vw-1.5rem))] max-w-[980px] overflow-hidden border border-neutral-200 bg-[#f7f4ef] p-0 text-neutral-950 shadow-[0_30px_120px_rgba(15,23,42,0.22)] sm:max-w-[980px]'
        showCloseButton
      >
        <div className='grid min-h-[560px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)]'>
          <div className='border-border/60 bg-[#f9f7f2] p-6 sm:p-8 lg:border-r lg:p-10'>
            <div className='space-y-2'>
              <h1 className='text-center text-3xl font-black tracking-[-0.05em] text-neutral-950 sm:text-3xl'>
                {currentModeLabel}登录
              </h1>
            </div>

            <div className='mt-6 space-y-6'>
              <LoginModeSwitcher />
              <LoginForm />
            </div>
          </div>

          <LoginArtwork />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LoginDialog
