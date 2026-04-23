import { create } from 'zustand'

import {
  DEFAULT_SHORTCUT_BINDINGS,
  resolveGlobalShortcutRegistrationStatuses,
  type GlobalShortcutRegistrationStatuses,
} from '../../shared/shortcut-keys'

type ShortcutRegistrationStoreState = {
  globalRegistrationStatuses: GlobalShortcutRegistrationStatuses
  syncGlobalRegistrationStatuses: (
    statuses: GlobalShortcutRegistrationStatuses
  ) => void
}

const defaultGlobalRegistrationStatuses =
  resolveGlobalShortcutRegistrationStatuses({
    enabled: false,
    bindings: DEFAULT_SHORTCUT_BINDINGS,
    isRegistered: () => false,
  })

export const useShortcutRegistrationStore =
  create<ShortcutRegistrationStoreState>(set => ({
    globalRegistrationStatuses: defaultGlobalRegistrationStatuses,
    syncGlobalRegistrationStatuses: statuses => {
      set({ globalRegistrationStatuses: statuses })
    },
  }))
