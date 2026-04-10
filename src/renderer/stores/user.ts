import { create } from 'zustand'
import { useAuthStore } from './auth-store'
import { userPlaylist } from '@/api/user'

const useUserStore = create((set, get) => ({
  likedPlaylist: [],
  myLikedPlaylistId: null,

  // 查询我的歌单
  fetchLikedPlaylist: async () => {
    try {
      const userId = useAuthStore.getState().user?.userId
      const res = await userPlaylist({ uid: userId })
      const data = res.data.playlist
      console.log(`useUserStore:fetchLikedPlaylist:${data}`)

      set(state => ({
        ...state,
        myLikedPlaylistId: data[0]?.id,
        likedPlaylist: data,
      }))
    } catch (err) {
      console.log('fetchLikedPlaylist', err)
    }
  },
}))

export { useUserStore }
