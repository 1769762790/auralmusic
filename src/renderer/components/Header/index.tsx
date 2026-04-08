import { useTheme } from '@/hooks/useTheme'
import Account from '../Account'
import NavBar from '../NavBar'
import Back from './Back'

const Header = ({ className }) => {
  const { currentTheme, setDarkTheme, setLightTheme } = useTheme()

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
    </header>
  )
}

export default Header
