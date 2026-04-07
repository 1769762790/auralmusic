import { create } from 'zustand'
import type { DailySong } from '@/pages/Home/home.type'

interface DailySongsStore {
  list: DailySong[]
  setList: (list: DailySong[]) => void
  getTopOne: DailySong[]
}

// 每日推荐
export const useDailySongs = create<DailySongsStore>((set, get) => ({
  list: [],
  setList: list => {
    return set({ list })
  },
  get getTopOne() {
    return get().list.slice(0, 1)
  },
}))
