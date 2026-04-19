import type { LucideIcon, LucideProps } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

interface IconProps extends LucideProps {
  name: string
}

function resolveLucideIcon(name: string): LucideIcon | null {
  const candidate = LucideIcons[name as keyof typeof LucideIcons]

  if (typeof candidate !== 'function') {
    return null
  }

  return candidate as LucideIcon
}

const Icon = ({ name, size = 24, ...props }: IconProps) => {
  const IconComponent = resolveLucideIcon(name)

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`)
    return null
  }

  return <IconComponent size={size} {...props} />
}

export default Icon
