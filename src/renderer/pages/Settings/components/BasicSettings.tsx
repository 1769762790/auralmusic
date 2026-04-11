import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/hooks/useTheme'

type ThemeValue = 'system' | 'light' | 'dark'

const THEME_OPTIONS: Array<{ label: string; value: ThemeValue }> = [
  { label: '自动', value: 'system' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
]

const BasicSettings = () => {
  const {
    currentTheme,
    isThemeLoading,
    setDarkTheme,
    setLightTheme,
    setSystemTheme,
  } = useTheme()

  const handleThemeChange = (value: ThemeValue) => {
    if (value === 'system') {
      void setSystemTheme()
      return
    }

    if (value === 'light') {
      void setLightTheme()
      return
    }

    void setDarkTheme()
  }

  return (
    <div className='space-y-1'>
      <div className='grid grid-cols-[minmax(0,1fr)_minmax(180px,240px)] items-center gap-6 py-3'>
        <div className='text-muted-foreground text-sm font-medium'>外观</div>
        <Select
          value={currentTheme}
          disabled={isThemeLoading}
          onValueChange={value => handleThemeChange(value as ThemeValue)}
        >
          <SelectTrigger className='bg-muted/60 h-9 w-full border-none px-4 shadow-none'>
            <SelectValue placeholder='自动' />
          </SelectTrigger>
          <SelectContent align='end'>
            {THEME_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Separator />
    </div>
  )
}

export default BasicSettings
