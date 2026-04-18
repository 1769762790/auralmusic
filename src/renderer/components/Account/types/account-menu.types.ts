export type AccountMenuActionKey = 'theme' | 'downloads' | 'settings' | 'logout'

export interface AccountMenuAction {
  key: AccountMenuActionKey
  label: string
  disabled?: boolean
  requiresSeparatorBefore?: boolean
  onSelect: () => void | Promise<void>
}

export interface CreateAccountMenuActionsOptions {
  isDark: boolean
  isLoading: boolean
  hasUser: boolean
  onToggleTheme: () => void
  onOpenDownloads: () => void
  onOpenSettings: () => void
  onLogout: () => Promise<void>
}
