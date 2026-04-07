import { EllipsisIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CategoriesPanel from './CategoriesPanel'
import CoverCard from '@/components/CoverCard'
import { geTopPlayList } from '@/api/list'
import { useIntersectionLoadMore } from '@/hooks/useLoadMore'

const SHOW_CAT_COUNT = 8

interface PlayListItem {
  id: string
  name: string
}

interface PlaylistCategoryItem {
  name: string
  category?: number
  [key: string]: unknown
}

interface PlaylistCategories {
  sub: PlaylistCategoryItem[]
  categories?: Record<string, string>
  [key: string]: unknown
}

const AllPlaylist = ({
  categories = { sub: [] },
}: {
  categories?: PlaylistCategories
}) => {
  const [isShow, setIsShow] = useState(false)
  const [cat, setCat] = useState<string | null>(null)

  const topCategories = useMemo(() => {
    const data = categories?.sub?.slice(0, SHOW_CAT_COUNT) || []
    return [{ name: '全部' }, ...data]
  }, [categories.sub])

  // 创建 API 包装函数，符合 useLoadMore 期望的签名
  const fetchPlayListData = useCallback(
    async (offset: number, limit: number) => {
      const response = await geTopPlayList({
        cat: cat || '全部',
        limit,
        offset,
      })
      return {
        list: response.data?.playlists || [],
        hasMore: response.data?.more ?? false,
      }
    },
    [cat]
  )

  // 使用 hook，cat 变化时自动重置
  const {
    data: playLists,
    loading,
    sentinelRef,
    reset,
  } = useIntersectionLoadMore<PlayListItem>(fetchPlayListData, {
    limit: 50,
  })

  // cat 变化时重置列表
  useEffect(() => {
    reset()
  }, [cat, reset])

  const handleCategoryChange = (categoryName: string) => {
    const newCat = categoryName === '全部' ? null : categoryName
    setCat(newCat)
    setIsShow(false)
  }

  const handlePlay = () => {
    // 处理播放逻辑
    console.log('play')
  }

  const onClickMore = () => {
    setIsShow(!isShow)
  }

  return (
    <div className='relative'>
      <div className='mt-5 mb-5 flex items-center'>
        {topCategories.map((topCat, index) => (
          <span
            className={`hover:bg-primary/20 cursor-pointer rounded px-3 py-2 text-center text-[16px] transition-colors ${
              (topCat.name === '全部' && cat === null) || topCat.name === cat
                ? 'bg-primary/20 font-semibold'
                : ''
            }`}
            key={index}
            onClick={() => handleCategoryChange(topCat.name)}
          >
            {topCat?.name || '未知分类'}
          </span>
        ))}
        <span
          className='hover:bg-primary/20 cursor-pointer rounded px-3 py-2 text-center transition-colors'
          onClick={onClickMore}
        >
          <EllipsisIcon />
        </span>
      </div>
      {isShow && (
        <CategoriesPanel
          className='tp-0 l-0 r-0 absolute z-20'
          categoryData={categories}
          currentCat={cat}
          onSelect={handleCategoryChange}
        />
      )}

      <div className='grid grid-cols-5 gap-6 xl:grid-cols-6 2xl:grid-cols-8'>
        {playLists.map(item => (
          <CoverCard key={item.id} data={item} onPlay={handlePlay} />
        ))}
      </div>

      {/* 哨兵元素，用于触发加载更多 */}
      <div ref={sentinelRef} className='flex h-20 items-center justify-center'>
        {loading && <span className='text-muted-foreground'>加载中...</span>}
      </div>
    </div>
  )
}

export default AllPlaylist
