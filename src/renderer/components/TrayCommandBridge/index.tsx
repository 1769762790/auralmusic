import { useEffect, useEffectEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TrayCommand } from '../../../shared/tray.ts'
import { usePlaybackStore } from '@/stores/playback-store'

function getTrayApi() {
  if (typeof window === 'undefined') {
    return null
  }

  return (
    (window as Window & { electronTray?: Window['electronTray'] })
      .electronTray ?? null
  )
}

const TrayCommandBridge = () => {
  const navigate = useNavigate()
  const currentTrack = usePlaybackStore(state => state.currentTrack)
  const status = usePlaybackStore(state => state.status)
  const playbackMode = usePlaybackStore(state => state.playbackMode)
  const togglePlay = usePlaybackStore(state => state.togglePlay)
  const playPrevious = usePlaybackStore(state => state.playPrevious)
  const playNext = usePlaybackStore(state => state.playNext)
  const setPlaybackMode = usePlaybackStore(state => state.setPlaybackMode)

  useEffect(() => {
    const trayApi = getTrayApi()
    if (!trayApi) {
      return
    }

    void trayApi.syncState({
      currentTrackName: currentTrack?.name ?? '',
      currentArtistNames: currentTrack?.artistNames ?? '',
      status,
      playbackMode,
      hasCurrentTrack: Boolean(currentTrack),
    })
  }, [currentTrack, playbackMode, status])

  const handleCommand = useEffectEvent((command: TrayCommand) => {
    if (command.type === 'toggle-play') {
      togglePlay()
      return
    }

    if (command.type === 'play-previous') {
      playPrevious()
      return
    }

    if (command.type === 'play-next') {
      playNext()
      return
    }

    if (command.type === 'set-playback-mode') {
      setPlaybackMode(command.playbackMode)
      return
    }

    if (command.type === 'open-settings') {
      navigate('/settings')
    }
  })

  useEffect(() => {
    const trayApi = getTrayApi()
    if (!trayApi) {
      return
    }

    return trayApi.onCommand(command => {
      handleCommand(command)
    })
  }, [])

  return null
}

export default TrayCommandBridge
