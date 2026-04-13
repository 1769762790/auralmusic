import type { CloseBehavior } from '../config/types'

export type WindowCloseBehaviorResult =
  | 'allow-close'
  | 'hide-to-tray'
  | 'request-confirmation'

export function resolveWindowCloseBehavior({
  isQuitting,
  closeBehavior,
}: {
  isQuitting: boolean
  closeBehavior: CloseBehavior
}): WindowCloseBehaviorResult {
  if (isQuitting || closeBehavior === 'quit') {
    return 'allow-close'
  }

  if (closeBehavior === 'minimize') {
    return 'hide-to-tray'
  }

  return 'request-confirmation'
}
