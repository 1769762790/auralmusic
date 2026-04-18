import { create } from 'zustand'
import type { SearchDialogStoreState } from '@/types/core'

export const useSearchDialogStore = create<SearchDialogStoreState>(set => ({
  open: false,
  setOpen: open => set({ open }),
  openDialog: () => set({ open: true }),
  closeDialog: () => set({ open: false }),
}))
