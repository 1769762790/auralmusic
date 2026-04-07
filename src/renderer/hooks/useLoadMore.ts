import { useCallback, useEffect, useRef, useState } from 'react'

export function useIntersectionLoadMore<T>(
  fetchFn: (
    offset: number,
    limit: number
  ) => Promise<{ list: T[]; hasMore: boolean }>,
  options: {
    limit?: number
    threshold?: number
  } = {}
) {
  const { limit = 50, threshold = 0.1 } = options

  const [data, setData] = useState<T[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [resetVersion, setResetVersion] = useState(0)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const requestVersionRef = useRef(0)
  const loadingRef = useRef(false)
  const canBootstrapRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return

    const requestVersion = requestVersionRef.current
    loadingRef.current = true
    setLoading(true)

    try {
      const result = await fetchFn(offset, limit)
      if (requestVersion !== requestVersionRef.current) {
        return
      }

      if (result.list.length === 0) {
        setHasMore(false)
        return
      }

      setData(prev => [...prev, ...result.list])
      setOffset(prev => prev + limit)
      setHasMore(result.hasMore !== false)
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return
      }

      console.error('加载更多失败', error)
      setHasMore(false)
    } finally {
      if (requestVersion === requestVersionRef.current) {
        loadingRef.current = false
        setLoading(false)
      }
    }
  }, [fetchFn, hasMore, limit, offset])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && !loading) {
          void loadMore()
        }
      },
      { threshold }
    )

    const currentElement = sentinelRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [hasMore, loadMore, loading, threshold])

  useEffect(() => {
    if (!canBootstrapRef.current) {
      canBootstrapRef.current = true
      return
    }

    if (offset === 0 && data.length === 0 && hasMore && !loading) {
      void loadMore()
    }
  }, [data.length, hasMore, loadMore, loading, offset, resetVersion])

  const reset = useCallback(() => {
    requestVersionRef.current += 1
    loadingRef.current = false
    setData([])
    setOffset(0)
    setHasMore(true)
    setLoading(false)
    setResetVersion(prev => prev + 1)
  }, [])

  return {
    data,
    loading,
    hasMore,
    sentinelRef,
    reset,
    loadMore,
  }
}
