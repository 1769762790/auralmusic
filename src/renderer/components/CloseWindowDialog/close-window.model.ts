import type { CloseBehavior } from '../../../main/config/types.ts'
import type { CloseWindowAction } from './types'

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
