import { create } from 'zustand'

import type { CollectToPlaylistStoreState } from '@/types/core'

export const useCollectToPlaylistStore = create<CollectToPlaylistStoreState>(
  set => ({
    open: false,
    song: null,
    setOpen: open =>
      set(state => ({
        open,
        song: open ? state.song : null,
      })),
    openDrawer: song =>
      set({
        open: true,
        song,
      }),
    closeDrawer: () =>
      set({
        open: false,
        song: null,
      }),
  })
)
