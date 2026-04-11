import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConfigStore } from '@/stores/config-store'
import type { AudioQualityLevel } from '../../../../main/config/types'
import {
  DEFAULT_AUDIO_OUTPUT_DEVICE_ID,
  mergeSelectedAudioOutputDevice,
  playAudioOutputTestTone,
  queryAudioOutputDevices,
  type AudioOutputDeviceOption,
  type AudioOutputDeviceQueryStatus,
} from '../settings-audio-output'
import MusicSourceSettingsDialog from './MusicSourceSettingsDialog'

const AUDIO_OUTPUT_STATUS_LABEL: Partial<
  Record<AudioOutputDeviceQueryStatus, string>
> = {
  empty: '暂未读取到可用的音频输出设备。',
  unsupported: '当前运行环境不支持读取音频输出设备。',
  'permission-denied': '未获得音频设备权限，暂时只能使用系统默认输出设备。',
  error: '音频输出设备读取失败，请稍后重试。',
}

const AUDIO_QUALITY_OPTIONS: Array<{
  label: string
  value: AudioQualityLevel
}> = [
  { label: '标准', value: 'standard' },
  { label: '较高', value: 'higher' },
  { label: '极高', value: 'exhigh' },
  { label: '无损', value: 'lossless' },
  { label: 'Hi-Res', value: 'hires' },
  { label: '高清环绕声', value: 'jyeffect' },
  { label: '沉浸环绕声', value: 'sky' },
  { label: '杜比全景声', value: 'dolby' },
  { label: '超清母带', value: 'jymaster' },
]

const PlaySettings = () => {
  const audioOutputDeviceId =
    useConfigStore(state => state.config.audioOutputDeviceId) ||
    DEFAULT_AUDIO_OUTPUT_DEVICE_ID
  const audioQuality = useConfigStore(state => state.config.quality)
  const musicSourceEnabled = useConfigStore(
    state => state.config.musicSourceEnabled
  )
  const isConfigLoading = useConfigStore(state => state.isLoading)
  const initConfig = useConfigStore(state => state.initConfig)
  const setConfig = useConfigStore(state => state.setConfig)
  const [devices, setDevices] = useState<AudioOutputDeviceOption[]>([])
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [musicSourceDialogOpen, setMusicSourceDialogOpen] = useState(false)
  const [queryStatus, setQueryStatus] =
    useState<AudioOutputDeviceQueryStatus | null>(null)
  const [queryMessage, setQueryMessage] = useState('')

  const audioOutputDevices = mergeSelectedAudioOutputDevice(
    devices,
    audioOutputDeviceId
  )

  const loadAudioOutputDevices = async () => {
    if (devicesLoading) {
      return
    }

    setDevicesLoading(true)

    const result = await queryAudioOutputDevices()
    setDevices(result.devices)
    setQueryStatus(result.status)
    setQueryMessage(result.message || '')
    setDevicesLoading(false)
  }

  useEffect(() => {
    if (!isConfigLoading) {
      return
    }

    void initConfig()
  }, [initConfig, isConfigLoading])

  useEffect(() => {
    void loadAudioOutputDevices()
    // 进入播放设置时主动读取一次，确保设备列表和权限状态及时刷新。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAudioOutputDeviceChange = (deviceId: string) => {
    void setConfig('audioOutputDeviceId', deviceId)
  }

  const handleAudioQualityChange = (quality: AudioQualityLevel) => {
    void setConfig('quality', quality)
  }

  const handleToggleMusicSource = () => {
    void setConfig('musicSourceEnabled', !musicSourceEnabled)
  }

  const handleTestAudioOutput = async () => {
    if (testing) {
      return
    }

    setTesting(true)

    try {
      await playAudioOutputTestTone(audioOutputDeviceId)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '测试音播放失败，请稍后重试。'
      )
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className='space-y-1'>
      <div className='grid grid-cols-[minmax(0,1fr)_minmax(220px,280px)] items-center gap-6 py-3'>
        <div className='text-muted-foreground text-sm font-medium'>
          音频输出设备
        </div>
        <div className='flex items-center gap-2'>
          <Select
            value={audioOutputDeviceId}
            disabled={isConfigLoading || devicesLoading}
            onOpenChange={open => {
              if (open) {
                void loadAudioOutputDevices()
              }
            }}
            onValueChange={handleAudioOutputDeviceChange}
          >
            <SelectTrigger className='bg-muted/60 h-9 min-w-0 flex-1 border-none px-4 shadow-none'>
              <SelectValue placeholder='选择输出设备' />
            </SelectTrigger>
            <SelectContent align='end'>
              {audioOutputDevices.map(device => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
              {devicesLoading ? (
                <SelectItem disabled value='__loading_audio_output_devices__'>
                  正在读取音频输出设备...
                </SelectItem>
              ) : null}
            </SelectContent>
          </Select>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            disabled={isConfigLoading || testing}
            aria-label='测试音频输出设备'
            className='bg-muted/60 size-9'
            onClick={handleTestAudioOutput}
          >
            <Volume2 className={testing ? 'animate-pulse' : undefined} />
          </Button>
        </div>
      </div>
      {queryStatus && queryStatus !== 'ok' ? (
        <p className='text-muted-foreground pb-3 text-xs'>
          {queryMessage || AUDIO_OUTPUT_STATUS_LABEL[queryStatus]}
        </p>
      ) : null}
      <Separator />

      <div className='grid grid-cols-[minmax(0,1fr)_minmax(220px,280px)] items-center gap-6 py-3'>
        <div className='text-muted-foreground text-sm font-medium'>
          播放音质
        </div>
        <Select
          value={audioQuality}
          disabled={isConfigLoading}
          onValueChange={value =>
            handleAudioQualityChange(value as AudioQualityLevel)
          }
        >
          <SelectTrigger className='bg-muted/60 h-9 w-full border-none px-4 shadow-none'>
            <SelectValue placeholder='选择播放音质' />
          </SelectTrigger>
          <SelectContent align='end'>
            {AUDIO_QUALITY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Separator />

      <div className='grid grid-cols-[minmax(0,1fr)_minmax(220px,280px)] items-center gap-6 py-3'>
        <div className='space-y-1'>
          <div className='text-muted-foreground text-sm font-medium'>
            音源设置
          </div>
          <p className='text-muted-foreground text-xs'>
            开启后将尝试解析无法播放的音乐
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            disabled={isConfigLoading}
            aria-pressed={musicSourceEnabled}
            onClick={handleToggleMusicSource}
            className={cn(
              'bg-muted/60 relative h-9 min-w-28 flex-1 rounded-full px-1 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
              musicSourceEnabled
                ? 'text-primary-foreground bg-primary/90'
                : 'text-muted-foreground'
            )}
          >
            <span
              aria-hidden
              className={cn(
                'bg-background absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full shadow-sm transition-transform duration-300',
                musicSourceEnabled ? 'translate-x-full' : 'translate-x-0'
              )}
            />
            <span className='relative z-10 grid h-full grid-cols-2 items-center'>
              <span
                className={cn(
                  'transition-colors',
                  !musicSourceEnabled && 'text-foreground'
                )}
              >
                关闭
              </span>
              <span
                className={cn(
                  'transition-colors',
                  musicSourceEnabled && 'text-foreground'
                )}
              >
                开启
              </span>
            </span>
          </button>
          {musicSourceEnabled ? (
            <Button
              type='button'
              variant='outline'
              className='h-9 shrink-0'
              onClick={() => setMusicSourceDialogOpen(true)}
            >
              选择音源
            </Button>
          ) : null}
        </div>
      </div>
      <Separator />

      <MusicSourceSettingsDialog
        open={musicSourceDialogOpen}
        onOpenChange={setMusicSourceDialogOpen}
      />
    </div>
  )
}

export default PlaySettings
