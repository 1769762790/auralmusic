import { cn } from '@/lib/utils'
import { useMemo } from 'react'

const CategoriesPanel = ({ categoryData, className, currentCat, onSelect }) => {
  // 分组数据：按【语种、风格、场景、情感、主题】归类
  const groupedCategories = useMemo(() => {
    const { sub = [], categories = {} } = categoryData

    // 1. 生成数字 -> 分类名的映射
    const catIdToName = Object.entries(categories).reduce(
      (map, [key, name]) => {
        map[Number(key)] = name
        return map
      },
      {} as Record<number, string>
    )

    // 2. 初始化空分组
    const grouped = Object.values(categories).reduce(
      (res, name) => {
        res[name] = []
        return res
      },
      {} as Record<string, typeof sub>
    )

    // 3. 遍历 sub 塞入对应分组
    sub.forEach(item => {
      const catName = catIdToName[item.category]
      if (catName) grouped[catName].push(item)
    })

    return grouped
  }, [categoryData])

  console.log('groupedCategories', groupedCategories)
  return (
    <div className={cn('w-full space-y-8 bg-white p-4', className)}>
      {/* 遍历每个分类 */}
      {Object.entries(groupedCategories).map(([categoryName, list]) => (
        <div key={categoryName} className='flex'>
          <h3 className='mr-[30px] mb-2 text-lg font-bold'>{categoryName}</h3>
          <div className='grid flex-1 grid-cols-8 gap-5'>
            {list.map(item => (
              <span
                key={item.name}
                className={cn(
                  'hover:bg-primary/20 cursor-pointer rounded px-3 py-1 text-center transition-colors',
                  currentCat == item.name && 'bg-primary/20 font-semibold'
                )}
                onClick={() => onSelect && onSelect(item.name)}
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CategoriesPanel
