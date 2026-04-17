export const ABOUT_UPDATE_UNAVAILABLE_MESSAGE = '暂未接入自动更新'

export const ABOUT_USAGE_NOTICE_LINES = [
  '本项目仅供个人技术学习，禁止任何侵权、非法二次分发与商用。',
  '任何使用者利用本工具实施的侵权行为，均与本项目开发者无关。',
  '如存在版权争议，请联系相关音源平台下架处理。',
  '请务必通过官方正版渠道购买会员、合法收听，共同维护良好音乐版权环境。',
] as const

export function resolveAboutVersionLabel(version: string | undefined | null) {
  const normalizedVersion = version?.trim()
  return normalizedVersion ? `v${normalizedVersion}` : '版本未知'
}
