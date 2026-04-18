export const ACCOUNT_MENU_LABELS = {
  themeToLight: '切换到浅色模式',
  themeToDark: '切换到深色模式',
  downloads: '下载管理',
  settings: '设置',
  logout: '退出账号',
} as const
import type {
  AccountMenuAction,
  CreateAccountMenuActionsOptions,
} from './types'

export function createAccountMenuActions(
  options: CreateAccountMenuActionsOptions
) {
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
