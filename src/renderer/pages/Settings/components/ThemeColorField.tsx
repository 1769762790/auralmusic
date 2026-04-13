import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  ColorPicker,
  ColorPickerHex,
  ColorPickerInput,
} from '@/components/ui/color-picker'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useConfigStore } from '@/stores/config-store'
import { normalizeThemeColor } from '@/theme/theme-color'

const SUGGESTED_THEME_COLOR = '#7C3AED'

const ThemeColorField = () => {
  const themeColor = useConfigStore(state => state.config.themeColor)
  const setConfig = useConfigStore(state => state.setConfig)
  const [draftValue, setDraftValue] = useState(
    themeColor ?? SUGGESTED_THEME_COLOR
  )

  useEffect(() => {
    setDraftValue(themeColor ?? SUGGESTED_THEME_COLOR)
  }, [themeColor])

  const handleColorChange = (value: string) => {
    setDraftValue(value)

    const normalizedColor = normalizeThemeColor(value)

    if (!normalizedColor) {
      return
    }

    void setConfig('themeColor', normalizedColor)
  }

  const handleInputBlur = () => {
    const normalizedColor = normalizeThemeColor(draftValue)

    if (normalizedColor) {
      setDraftValue(normalizedColor)
      return
    }

    setDraftValue(themeColor ?? SUGGESTED_THEME_COLOR)
  }

  const handleReset = () => {
    setDraftValue(SUGGESTED_THEME_COLOR)
    void setConfig('themeColor', null)
  }

  const previewColor = themeColor ?? 'var(--primary)'
  const displayValue = themeColor ?? '默认主题色'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='bg-muted/60 h-9 w-full justify-between rounded-xl border-none px-3 shadow-none'
        >
          <span className='flex min-w-0 items-center gap-3'>
            <span
              className='border-border size-4 shrink-0 rounded-full border'
              style={{ backgroundColor: previewColor }}
            />
            <span className='truncate'>{displayValue}</span>
          </span>
          <span className='text-muted-foreground shrink-0 text-xs'>
            点击调整
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-[340px] rounded-2xl p-4'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-start justify-between gap-3'>
            <PopoverHeader className='gap-1'>
              <PopoverTitle>主题色</PopoverTitle>
              <PopoverDescription className='text-xs'>
                实时影响主色、强调色和侧边栏高亮。
              </PopoverDescription>
            </PopoverHeader>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              disabled={!themeColor}
              onClick={handleReset}
            >
              <RotateCcw data-icon='inline-start' />
              恢复默认
            </Button>
          </div>

          <div className='border-border bg-muted/30 flex items-center gap-3 rounded-2xl border p-3'>
            <span
              className='size-10 shrink-0 rounded-2xl'
              style={{ backgroundColor: previewColor }}
            />
            <div className='min-w-0'>
              <p className='text-sm font-medium'>{displayValue}</p>
              <p className='text-muted-foreground text-xs'>
                浅色和深色模式共用这一个主题色
              </p>
            </div>
          </div>

          <ColorPicker className='border-border bg-muted/20 min-h-0 w-full rounded-[22px] border p-3 shadow-none'>
            <ColorPickerHex
              color={normalizeThemeColor(draftValue) ?? SUGGESTED_THEME_COLOR}
              onChange={handleColorChange}
            />
          </ColorPicker>

          <div className='border-border bg-muted/20 rounded-xl border px-3 py-2'>
            <ColorPickerInput
              value={draftValue}
              onBlur={handleInputBlur}
              onChange={event => handleColorChange(event.target.value)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ThemeColorField
