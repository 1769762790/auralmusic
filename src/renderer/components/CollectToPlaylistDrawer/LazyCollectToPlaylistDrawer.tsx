import { useDeferredComponent } from '@/hooks/useDeferredComponent'
import { useCollectToPlaylistStore } from '@/stores/collect-to-playlist-store'

type CollectToPlaylistDrawerComponent = (typeof import('./index'))['default']

let loadedCollectToPlaylistDrawer: CollectToPlaylistDrawerComponent | null =
  null
let loadCollectToPlaylistDrawerPromise: Promise<CollectToPlaylistDrawerComponent> | null =
  null

const loadCollectToPlaylistDrawer = () => {
  if (loadedCollectToPlaylistDrawer) {
    return Promise.resolve(loadedCollectToPlaylistDrawer)
  }

  loadCollectToPlaylistDrawerPromise ??= import('./index').then(module => {
    loadedCollectToPlaylistDrawer = module.default
    return module.default
  })

  return loadCollectToPlaylistDrawerPromise
}

const LazyCollectToPlaylistDrawer = () => {
  const open = useCollectToPlaylistStore(state => state.open)
  const CollectToPlaylistDrawer = useDeferredComponent(
    open,
    loadCollectToPlaylistDrawer,
    loadedCollectToPlaylistDrawer
  )

  if (!CollectToPlaylistDrawer) {
    return null
  }

  return <CollectToPlaylistDrawer />
}

export default LazyCollectToPlaylistDrawer
