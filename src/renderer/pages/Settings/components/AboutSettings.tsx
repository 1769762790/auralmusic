import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useUpdateStore } from '@/stores/update-store'

import {
  ABOUT_UP_TO_DATE_MESSAGE,
  ABOUT_UPDATE_PREVIEW_BUTTON_LABEL,
  ABOUT_USAGE_NOTICE_LINES,
  createAboutUpdatePreviewSnapshot,
  handleAboutCheckForUpdates,
  resolveCheckUpdateButtonLabel,
  resolveAboutVersionSummary,
} from './about-settings.model'

const AboutSettings = () => {
  const updateSnapshot = useUpdateStore(state => state.snapshot)
  const syncUpdateSnapshot = useUpdateStore(state => state.syncSnapshot)
  const openUpdateModal = useUpdateStore(state => state.openModal)
  const buttonLabel = resolveCheckUpdateButtonLabel(updateSnapshot)
  const isDevelopment = import.meta.env.DEV
  const appVersion =
    updateSnapshot.currentVersion || window.appRuntime.getAppVersion()
  const versionSummary = resolveAboutVersionSummary({
    appVersion,
    latestVersion: updateSnapshot.latestVersion,
  })

  return (
    <div className='space-y-1'>
      <div className='grid grid-cols-[minmax(0,1fr)_minmax(220px,280px)] items-center gap-6 py-3'>
        <div className='space-y-1'>
          <div className='text-muted-foreground text-sm font-medium'>
            当前版本
          </div>
          <p className='text-foreground text-sm font-semibold tabular-nums'>
            {versionSummary.currentLabel}
          </p>
          {versionSummary.latestLabel && (
            <p className='text-muted-foreground text-xs tabular-nums'>
              最新版本 {versionSummary.latestLabel}
            </p>
          )}
        </div>
        <div className='space-y-2 justify-self-end'>
          <Button
            type='button'
            variant='outline'
            className='h-9 w-full'
            disabled={updateSnapshot.status === 'checking'}
            onClick={async () => {
              await handleAboutCheckForUpdates({
                snapshot: updateSnapshot,
                checkForUpdates: window.electronUpdate.checkForUpdates,
                openUpdateModal,
                showUpToDateMessage: () => {
                  toast.success(ABOUT_UP_TO_DATE_MESSAGE)
                },
                showErrorMessage: message => {
                  toast.error(message)
                },
              })
            }}
          >
            {buttonLabel}
          </Button>
          {isDevelopment && (
            <Button
              type='button'
              variant='secondary'
              className='h-8 w-full'
              onClick={() => {
                syncUpdateSnapshot(
                  createAboutUpdatePreviewSnapshot({
                    currentVersion: appVersion,
                    platform: window.appRuntime.getPlatform(),
                  })
                )
                openUpdateModal()
              }}
            >
              {ABOUT_UPDATE_PREVIEW_BUTTON_LABEL}
            </Button>
          )}
        </div>
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
