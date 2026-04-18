import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  addSongToPlaylist,
  createPlaylist,
  getPlaylistSongIds,
} from '@/api/list'
import { getCollectPlaylistTargets } from '@/api/user'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  buildCreatePlaylistPayload,
  CREATE_PLAYLIST_TITLE_MAX_LENGTH,
  findCreatedCollectPlaylistTarget,
  insertCollectPlaylistTarget,
  isSongInPlaylistTrackIds,
} from '@/model'
import { useAuthStore } from '@/stores/auth-store'
import { useCollectToPlaylistStore } from '@/stores/collect-to-playlist-store'
import { useUserStore } from '@/stores/user'
import type { CollectPlaylistTarget } from '@/types/core'
import { RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'

import CollectToPlaylistCreateForm from './components/CollectToPlaylistCreateForm'
import CollectToPlaylistSongSummary from './components/CollectToPlaylistSongSummary'
import CollectToPlaylistTargetList from './components/CollectToPlaylistTargetList'

const COLLECT_PLAYLIST_LOAD_ERROR =
  '\u6b4c\u5355\u5217\u8868\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'
const COLLECT_PLAYLIST_DUPLICATE_ERROR =
  '\u6b4c\u66f2\u5df2\u5728\u6b4c\u5355\u4e2d'
const COLLECT_PLAYLIST_ADD_ERROR =
  '\u6536\u85cf\u5230\u6b4c\u5355\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'
const COLLECT_PLAYLIST_CREATE_ERROR =
  '\u6b4c\u5355\u521b\u5efa\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'
const COLLECT_PLAYLIST_TITLE = '\u6dfb\u52a0\u5230\u6b4c\u5355'
const COLLECT_PLAYLIST_DESCRIPTION =
  '\u9009\u62e9\u76ee\u6807\u6b4c\u5355\uff0c\u6216\u5148\u521b\u5efa\u4e00\u4e2a\u65b0\u6b4c\u5355\u3002'
const COLLECT_PLAYLIST_CLOSE_LABEL =
  '\u5173\u95ed\u6dfb\u52a0\u5230\u6b4c\u5355\u62bd\u5c49'
const COLLECT_PLAYLIST_RELOAD_LABEL = '\u91cd\u65b0\u52a0\u8f7d'

const CollectToPlaylistDrawer = () => {
  const userId = useAuthStore(state => state.user?.userId)
  const open = useCollectToPlaylistStore(state => state.open)
  const song = useCollectToPlaylistStore(state => state.song)
  const setOpen = useCollectToPlaylistStore(state => state.setOpen)
  const closeDrawer = useCollectToPlaylistStore(state => state.closeDrawer)

  const likedSongsLoaded = useUserStore(state => state.likedSongsLoaded)
  const fetchLikedSongs = useUserStore(state => state.fetchLikedSongs)

  const [playlists, setPlaylists] = useState<CollectPlaylistTarget[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [createExpanded, setCreateExpanded] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [createPrivate, setCreatePrivate] = useState(false)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [pendingPlaylistId, setPendingPlaylistId] = useState<number | null>(
    null
  )

  const playlistTrackIdsRef = useRef(new Map<number, number[]>())

  const createPayload = useMemo(
    () => buildCreatePlaylistPayload(createTitle, createPrivate),
    [createPrivate, createTitle]
  )

  const resetLocalState = () => {
    setPlaylists([])
    setLoading(false)
    setLoadError('')
    setCreateExpanded(false)
    setCreateTitle('')
    setCreatePrivate(false)
    setCreateSubmitting(false)
    setPendingPlaylistId(null)
    playlistTrackIdsRef.current = new Map()
  }

  const loadPlayableTargets = useCallback(
    async (bustCache = false) => {
      if (!userId) {
        return []
      }

      setLoading(true)
      setLoadError('')

      try {
        const nextTargets = await getCollectPlaylistTargets({
          uid: userId,
          timestamp: bustCache ? Date.now() : undefined,
        })
        setPlaylists(nextTargets)
        return nextTargets
      } catch (error) {
        console.error('collect playlist targets fetch failed', error)
        setLoadError(COLLECT_PLAYLIST_LOAD_ERROR)
        toast.error(COLLECT_PLAYLIST_LOAD_ERROR)
        return []
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  useEffect(() => {
    if (!open || !userId || !song) {
      resetLocalState()
      return
    }

    let cancelled = false

    const run = async () => {
      const nextTargets = await loadPlayableTargets(true)
      if (!cancelled) {
        setPlaylists(nextTargets)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [loadPlayableTargets, open, song, userId])

  const handleAddToPlaylist = async (playlist: CollectPlaylistTarget) => {
    if (!song || !userId || pendingPlaylistId !== null) {
      return false
    }

    setPendingPlaylistId(playlist.id)

    try {
      if (playlist.isLikedPlaylist) {
        if (!likedSongsLoaded) {
          await fetchLikedSongs()
        }

        if (useUserStore.getState().likedSongIds.has(song.songId)) {
          toast.error(COLLECT_PLAYLIST_DUPLICATE_ERROR)
          return false
        }
      } else {
        let trackIds = playlistTrackIdsRef.current.get(playlist.id)

        if (!trackIds) {
          trackIds = await getPlaylistSongIds({
            id: playlist.id,
            trackCount: playlist.trackCount,
            timestamp: Date.now(),
          })
          playlistTrackIdsRef.current.set(playlist.id, trackIds)
        }

        if (isSongInPlaylistTrackIds(song.songId, trackIds)) {
          toast.error(COLLECT_PLAYLIST_DUPLICATE_ERROR)
          return false
        }
      }

      await addSongToPlaylist({
        playlistId: playlist.id,
        trackId: song.songId,
        isLikedPlaylist: playlist.isLikedPlaylist,
        userId,
        timestamp: Date.now(),
      })

      if (playlist.isLikedPlaylist) {
        await fetchLikedSongs()
      } else {
        const currentTrackIds =
          playlistTrackIdsRef.current.get(playlist.id) || []
        playlistTrackIdsRef.current.set(playlist.id, [
          ...currentTrackIds,
          song.songId,
        ])
      }

      toast.success(`\u5df2\u6dfb\u52a0\u5230 ${playlist.name}`)
      closeDrawer()
      return true
    } catch (error) {
      console.error('collect song to playlist failed', error)
      toast.error(COLLECT_PLAYLIST_ADD_ERROR)
      return false
    } finally {
      setPendingPlaylistId(null)
    }
  }

  const handleCreateAndCollect = async () => {
    if (!userId || !song || !createPayload || createSubmitting) {
      return
    }

    setCreateSubmitting(true)

    try {
      const previousTargets = playlists
      await createPlaylist(createPayload)

      const refreshedTargets = await getCollectPlaylistTargets({
        uid: userId,
        timestamp: Date.now(),
      })

      const createdTarget = findCreatedCollectPlaylistTarget(
        previousTargets,
        refreshedTargets,
        createPayload.name
      )

      const nextTargets = createdTarget
        ? insertCollectPlaylistTarget(refreshedTargets, createdTarget)
        : refreshedTargets

      setPlaylists(nextTargets)

      if (!createdTarget) {
        throw new Error('created playlist target not found')
      }

      const success = await handleAddToPlaylist(createdTarget)

      if (success) {
        setCreateExpanded(false)
        setCreateTitle('')
        setCreatePrivate(false)
      }
    } catch (error) {
      console.error('create playlist and collect failed', error)
      toast.error(COLLECT_PLAYLIST_CREATE_ERROR)
    } finally {
      setCreateSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction='right'>
      <DrawerContent
        data-vaul-custom-container='true'
        data-vaul-no-drag
        className='border-border/70 bg-background/96 !top-4 !right-4 !bottom-4 h-auto w-[calc(100vw-32px)] max-w-none rounded-[30px] border p-0 shadow-[0_28px_90px_rgba(15,23,42,0.18)] backdrop-blur-2xl data-[vaul-drawer-direction=right]:!top-4 data-[vaul-drawer-direction=right]:!right-4 data-[vaul-drawer-direction=right]:!bottom-4 data-[vaul-drawer-direction=right]:!h-auto data-[vaul-drawer-direction=right]:!w-[calc(100vw-32px)] data-[vaul-drawer-direction=right]:!max-w-none data-[vaul-drawer-direction=right]:!rounded-[30px] data-[vaul-drawer-direction=right]:!border data-[vaul-drawer-direction=right]:sm:!w-[420px] data-[vaul-drawer-direction=right]:sm:!max-w-[420px]'
      >
        <DrawerHeader className='flex-row items-start justify-between gap-3 border-b px-5 py-4'>
          <div className='space-y-1'>
            <DrawerTitle className='text-lg font-semibold'>
              {COLLECT_PLAYLIST_TITLE}
            </DrawerTitle>
            <DrawerDescription>
              {COLLECT_PLAYLIST_DESCRIPTION}
            </DrawerDescription>
          </div>

          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={closeDrawer}
            className='rounded-full'
            aria-label={COLLECT_PLAYLIST_CLOSE_LABEL}
          >
            <X className='size-4' />
          </Button>
        </DrawerHeader>

        {song ? (
          <>
            <CollectToPlaylistSongSummary
              song={song}
              createExpanded={createExpanded}
              onToggleCreate={() => setCreateExpanded(current => !current)}
            />

            {createExpanded ? (
              <CollectToPlaylistCreateForm
                title={createTitle}
                isPrivate={createPrivate}
                submitting={createSubmitting}
                disabled={!createPayload || createSubmitting}
                maxLength={CREATE_PLAYLIST_TITLE_MAX_LENGTH}
                onTitleChange={setCreateTitle}
                onPrivateChange={setCreatePrivate}
                onSubmit={() => void handleCreateAndCollect()}
              />
            ) : null}

            {loadError ? (
              <div className='px-5 py-4'>
                <div className='border-destructive/20 bg-destructive/5 rounded-[20px] border px-4 py-4'>
                  <p className='text-destructive text-sm'>{loadError}</p>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => void loadPlayableTargets(true)}
                    className='mt-3 h-9 rounded-[14px]'
                  >
                    <RefreshCw className='mr-2 size-4' />
                    {COLLECT_PLAYLIST_RELOAD_LABEL}
                  </Button>
                </div>
              </div>
            ) : null}

            <CollectToPlaylistTargetList
              playlists={playlists}
              loading={loading}
              pendingPlaylistId={pendingPlaylistId}
              onAdd={playlist => {
                void handleAddToPlaylist(playlist)
              }}
            />
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

export default CollectToPlaylistDrawer
