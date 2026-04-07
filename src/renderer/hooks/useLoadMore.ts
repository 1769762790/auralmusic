import { useState, useEffect, useRef, useCallback } from 'react'

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
  const { limit = 50 } = options

  const [data, setData] = useState<T[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const sentinelRef = useRef<HTMLDivElement>(null)

  // 加载更多
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return

    setLoading(true)
    try {
      const result = await fetchFn(offset, limit)
      if (result.list.length === 0) {
        setHasMore(false)
      } else {
        setData(prev => [...prev, ...result.list])
        setOffset(prev => prev + limit)
        setHasMore(result.hasMore !== false)
      }
    } catch (err) {
      console.error('加载失败', err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, offset, limit, loading, hasMore])

  // 监听哨兵
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [loadMore, hasMore, loading])

  // 重置列表（切换分类、搜索时用）
  const reset = useCallback(() => {
    setData([])
    setOffset(0)
    setHasMore(true)
    setLoading(false)
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
