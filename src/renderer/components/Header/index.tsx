import { useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'
import Account from '../Account'
import LoginDialog from '../LoginDialog'
import NavBar from '../NavBar'
import Back from './Back'
import { useAuthStore } from '@/stores/auth-store'

interface HeaderProps {
  className?: string
}

const Header = ({ className = '' }: HeaderProps) => {
  const { currentTheme, setDarkTheme, setLightTheme } = useTheme()
  const hydrateAuth = useAuthStore(state => state.hydrateAuth)

  useEffect(() => {
    void hydrateAuth()
  }, [hydrateAuth])

  const onToggleTheme = () => {
    if (currentTheme === 'dark') {
      setLightTheme()
    } else {
      setDarkTheme()
    }
  }
  return (
    <header
      className={`bg-background flex w-full items-center justify-between px-4 py-4 transition-all duration-300 ${className}`}
    >
      <Back />
      <NavBar />
      <Account onToggleTheme={onToggleTheme} currentTheme={currentTheme} />
      <LoginDialog />
    </header>
  )
}

export default Header
