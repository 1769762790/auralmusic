import type { CloseBehavior } from '../../../../main/config/types.ts'

export type CloseWindowAction = Exclude<CloseBehavior, 'ask'>
