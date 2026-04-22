import { create } from 'zustand'

import type { PlaybackQueueDrawerStoreState } from '@/types/core'

export const usePlaybackQueueDrawerStore =
  create<PlaybackQueueDrawerStoreState>(set => ({
    open: false,
    setOpen: open => set({ open }),
    openDrawer: () => set({ open: true }),
    closeDrawer: () => set({ open: false }),
    toggleDrawer: () => set(state => ({ open: !state.open })),
  }))
