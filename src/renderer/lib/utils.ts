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
