import { create } from 'zustand'
import type { DailySongsStoreState } from '@/types/core'

// 姣忔棩鎺ㄨ崘
export const useDailySongs = create<DailySongsStoreState>((set, get) => ({
  list: [],
  setList: list => {
    return set({ list })
  },
  get getTopOne() {
    return get().list.slice(0, 1)
  },
}))
