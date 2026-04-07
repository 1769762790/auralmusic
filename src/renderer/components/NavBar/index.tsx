import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Link } from 'react-router-dom'
import React from 'react'
import { routeMenuConfig } from '../../router/router.config'
import Icon from '../Icon'

const NavBar = () => {
  // 取根布局的 children 作为菜单数据源（因为根布局 hidden）
  const menuData = routeMenuConfig[0]?.children || []
  return (
    <nav className='flex h-full w-full items-center justify-center px-4'>
      <NavigationMenu>
        <NavigationMenuList>
          {menuData.map(
            item =>
              !item.meta.hidden && (
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
