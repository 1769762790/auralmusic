import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ACCOUNT_MENU_LABELS,
  createAccountMenuActions,
} from '../src/renderer/components/Account/account-menu.model.ts'

test('createAccountMenuActions includes 下载管理 without requiring login', () => {
  let downloadsOpened = false

  const actions = createAccountMenuActions({
    isDark: false,
    isLoading: false,
    hasUser: false,
    onToggleTheme: () => undefined,
    onOpenSettings: () => undefined,
    onOpenDownloads: () => {
      downloadsOpened = true
    },
    onLogout: async () => undefined,
  })

  const downloadAction = actions.find(
    action => action.label === ACCOUNT_MENU_LABELS.downloads
  )

  assert.ok(downloadAction)
  downloadAction?.onSelect()
  assert.equal(downloadsOpened, true)
})
