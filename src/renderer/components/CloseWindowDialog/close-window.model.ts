import type { CloseBehavior } from '../../../shared/config.ts'
import type { CloseWindowAction } from './types'

export type { CloseWindowAction } from './types'

export function shouldShowCloseWindowDialog(closeBehavior: CloseBehavior) {
  return closeBehavior === 'ask'
}

export function resolveCloseWindowDialogConfig(
  action: CloseWindowAction,
  rememberCloseChoice: boolean
) {
  if (!rememberCloseChoice) {
    return {
      closeBehavior: 'ask' as const,
      rememberCloseChoice: false,
    }
  }

  return {
    closeBehavior: action,
    rememberCloseChoice: true,
  }
}
