import { usePlaybackStore } from '@/stores/playback-store'
import { useDeferredComponent } from '@/hooks/useDeferredComponent'

type PlayerSceneComponent = (typeof import('./index'))['default']

let loadedPlayerScene: PlayerSceneComponent | null = null
let loadPlayerScenePromise: Promise<PlayerSceneComponent> | null = null

const loadPlayerScene = () => {
  if (loadedPlayerScene) {
    return Promise.resolve(loadedPlayerScene)
  }

  loadPlayerScenePromise ??= import('./index').then(module => {
    loadedPlayerScene = module.default
    return module.default
  })

  return loadPlayerScenePromise
}

const LazyPlayerScene = () => {
  const isOpen = usePlaybackStore(state => state.isPlayerSceneOpen)
  const PlayerScene = useDeferredComponent(
    isOpen,
    loadPlayerScene,
    loadedPlayerScene
  )

  if (!PlayerScene) {
    return null
  }

  return <PlayerScene />
}

export default LazyPlayerScene
