export interface AvatarCoverProps {
  url: string
  rounded?: 'full' | string
  className?: string
  shadowClassName?: string
  wrapperClass?: string
  isAutoHovered?: boolean
  onClickCover?: () => void
}
