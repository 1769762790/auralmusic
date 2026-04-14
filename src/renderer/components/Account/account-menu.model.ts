export const ACCOUNT_MENU_LABELS = {
  themeToLight: '切换到浅色模式',
  themeToDark: '切换到深色模式',
  downloads: '下载管理',
  settings: '设置',
  logout: '退出账号',
} as const

export type AccountMenuActionKey = 'theme' | 'downloads' | 'settings' | 'logout'

export interface AccountMenuAction {
  key: AccountMenuActionKey
  label: string
  disabled?: boolean
  requiresSeparatorBefore?: boolean
  onSelect: () => void | Promise<void>
}

export function createAccountMenuActions(options: {
  isDark: boolean
  isLoading: boolean
  hasUser: boolean
  onToggleTheme: () => void
  onOpenDownloads: () => void
  onOpenSettings: () => void
  onLogout: () => Promise<void>
}) {
  const actions: AccountMenuAction[] = [
    {
      key: 'theme',
      label: options.isDark
        ? ACCOUNT_MENU_LABELS.themeToLight
        : ACCOUNT_MENU_LABELS.themeToDark,
      onSelect: options.onToggleTheme,
    },
    {
      key: 'downloads',
      label: ACCOUNT_MENU_LABELS.downloads,
      onSelect: options.onOpenDownloads,
    },
    {
      key: 'settings',
      label: ACCOUNT_MENU_LABELS.settings,
      onSelect: options.onOpenSettings,
    },
  ]

  if (options.hasUser) {
    actions.push({
      key: 'logout',
      label: ACCOUNT_MENU_LABELS.logout,
      disabled: options.isLoading,
      requiresSeparatorBefore: true,
      onSelect: options.onLogout,
    })
  }

  return actions
}
