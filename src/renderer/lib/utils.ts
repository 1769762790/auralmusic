import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 根据指定数量分割数组为二维数组（分组）
 * @param arr 要分组的原始数组
 * @param count 每组的元素数量
 * @returns 分组后的二维数组
 */
export function chunkArray<T>(arr: T[], count: number): T[][] {
  // 边界处理：空数组 / count 小于1 直接返回空数组
  if (!Array.isArray(arr) || count < 1) return []

  const result: T[][] = []
  // 循环分割，每次截取 count 个元素
  for (let i = 0; i < arr.length; i += count) {
    result.push(arr.slice(i, i + count))
  }
  return result
}

/**
 * 判断值是否 非null、非undefined
 * @param value 任意值
 * @returns boolean
 */
export function isDef<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function formatPlayCount(playCount?: number): string {
  if (!playCount || playCount <= 0) return ''

  // 1亿及以上
  if (playCount >= 100000000) {
    const yi = playCount / 100000000
    // 如果是整数（如2亿），不显示小数；否则保留1位小数
    return yi % 1 === 0 ? `${yi}亿` : `${yi.toFixed(1)}亿`
  }

  // 1万及以上
  if (playCount >= 10000) {
    const wan = playCount / 10000
    return wan % 1 === 0 ? `${wan}万` : `${wan.toFixed(1)}万`
  }

  // 1万以下，使用千分位
  return new Intl.NumberFormat('zh-CN').format(playCount)
}
