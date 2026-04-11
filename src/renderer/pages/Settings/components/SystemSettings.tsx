import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useSystemFont, SYSTEM_FONT_VALUE } from '@/hooks/useSystemFont'
import {
  mergeFontFamilies,
  querySystemFontFamilies,
  type SystemFontQueryStatus,
} from '../settings-fonts'

const FONT_LABELS: Record<string, string> = {
  'Inter Variable': 'Inter',
  'Geist Variable': 'Geist',
  [SYSTEM_FONT_VALUE]: '系统默认',
}

function getFontLabel(fontFamily: string) {
  return FONT_LABELS[fontFamily] || fontFamily
}

const SystemSettings = () => {
  const { currentFontFamily, isFontLoading, setFontFamily } = useSystemFont()
  const [systemFonts, setSystemFonts] = useState<string[]>([])
  const [systemFontsLoading, setSystemFontsLoading] = useState(false)
  const [systemFontsLoaded, setSystemFontsLoaded] = useState(false)
  const [queryStatus, setQueryStatus] = useState<SystemFontQueryStatus | null>(
    null
  )
  const [queryMessage, setQueryMessage] = useState('')

  const fontFamilies = mergeFontFamilies(systemFonts, currentFontFamily)

  const loadSystemFonts = async () => {
    if (systemFontsLoaded || systemFontsLoading) {
      return
    }

    setSystemFontsLoading(true)

    const result = await querySystemFontFamilies()
    setSystemFonts(result.fonts)
    setQueryStatus(result.status)
    setQueryMessage(result.message || '')
    setSystemFontsLoaded(true)
    setSystemFontsLoading(false)
  }

  return (
    <div className='space-y-1'>
      <div className='grid grid-cols-[minmax(0,1fr)_minmax(180px,240px)] items-center gap-6 py-3'>
        <div className='text-muted-foreground text-sm font-medium'>
          系统字体
        </div>
        <Select
          value={currentFontFamily}
          disabled={isFontLoading}
          onOpenChange={open => {
            if (open) {
              void loadSystemFonts()
            }
          }}
          onValueChange={value => void setFontFamily(value)}
        >
          <SelectTrigger className='bg-muted/60 h-9 w-full border-none px-4 shadow-none'>
            <SelectValue placeholder='选择字体' />
          </SelectTrigger>
          <SelectContent align='end'>
            {fontFamilies.map(fontFamily => (
              <SelectItem key={fontFamily} value={fontFamily}>
                <span style={{ fontFamily }}>{getFontLabel(fontFamily)}</span>
              </SelectItem>
            ))}
            {systemFontsLoading ? (
              <SelectItem disabled value='__loading_system_fonts__'>
                正在读取系统字体...
              </SelectItem>
            ) : null}
          </SelectContent>
        </Select>
      </div>
      {queryStatus && queryStatus !== 'ok' ? (
        <p className='text-muted-foreground pb-3 text-xs'>
          {queryMessage || '暂未读取到系统字体。'}
        </p>
      ) : null}
      <Separator />
    </div>
  )
}

export default SystemSettings
