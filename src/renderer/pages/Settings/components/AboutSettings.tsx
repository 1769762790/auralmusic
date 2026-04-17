import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import {
  ABOUT_UPDATE_UNAVAILABLE_MESSAGE,
  ABOUT_USAGE_NOTICE_LINES,
  resolveAboutVersionLabel,
} from './about-settings.model'

const AboutSettings = () => {
  const appVersion = window.appRuntime.getAppVersion()

  return (
    <div className='space-y-1'>
      <div className='grid grid-cols-[minmax(0,1fr)_minmax(220px,280px)] items-center gap-6 py-3'>
        <div className='space-y-1'>
          <div className='text-muted-foreground text-sm font-medium'>
            当前版本
          </div>
          <p className='text-foreground text-sm font-semibold tabular-nums'>
            {resolveAboutVersionLabel(appVersion)}
          </p>
        </div>
        <Button
          type='button'
          variant='outline'
          className='h-9 justify-self-end'
          onClick={() => {
            toast.info(ABOUT_UPDATE_UNAVAILABLE_MESSAGE)
          }}
        >
          检查更新
        </Button>
      </div>
      <Separator />
      <div className='space-y-3 py-3'>
        <div className='text-muted-foreground text-sm font-medium'>
          使用声明
        </div>
        <div className='text-muted-foreground space-y-1 text-sm leading-6'>
          {ABOUT_USAGE_NOTICE_LINES.map(line => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <Separator />
    </div>
  )
}

export default AboutSettings
