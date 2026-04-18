import type { CloseBehavior } from '../../../../shared/config.ts'

export type CloseWindowAction = Exclude<CloseBehavior, 'ask'>
