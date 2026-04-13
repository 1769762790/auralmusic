import { create } from 'zustand'

import type { CollectPlaylistSongContext } from '../model/collect-to-playlist.model.ts'

interface CollectToPlaylistStoreState {
  open: boolean
  song: CollectPlaylistSongContext | null
  setOpen: (open: boolean) => void
  openDrawer: (song: CollectPlaylistSongContext) => void
  closeDrawer: () => void
}

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
