import { Link } from 'react-router-dom'

import { routeMenuConfig } from '@/router/router.config'
import { useAuthStore } from '@/stores/auth-store'

import Icon from '../Icon'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

const NavBar = () => {
  const menuData = routeMenuConfig[0]?.children || []
  const loginStatus = useAuthStore(state => state.loginStatus)
  const isAuthenticated = loginStatus === 'authenticated'

  return (
    <nav className='group flex h-full w-full items-center justify-center px-4'>
      <NavigationMenu>
        <NavigationMenuList>
          {menuData.map(
            item =>
              !item.meta.hidden &&
              (!item.meta.authOnly || isAuthenticated) && (
                <NavigationMenuItem key={item.meta.title}>
                  <NavigationMenuLink asChild>
                    <Link to={item.path} className='px-10 text-xl font-bold'>
                      {item.meta.icon && (
                        <Icon name={item.meta.icon} className='mr-2 h-4 w-4' />
                      )}
                      {item.meta.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  )
}

export default NavBar
