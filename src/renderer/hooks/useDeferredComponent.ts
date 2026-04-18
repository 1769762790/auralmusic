import { useEffect, useState, type ComponentType } from 'react'

export const useDeferredComponent = <TComponent extends ComponentType>(
  enabled: boolean,
  loadComponent: () => Promise<TComponent>,
  initialComponent: TComponent | null
) => {
  const [Component, setComponent] = useState<TComponent | null>(
    () => initialComponent
  )

  useEffect(() => {
    if (!enabled || Component) {
      return
    }

    let active = true

    void loadComponent().then(nextComponent => {
      if (active) {
        setComponent(() => nextComponent)
      }
    })

    return () => {
      active = false
    }
  }, [Component, enabled, loadComponent])

  return Component
}
