import type { SinkIdMediaElement } from '@/types/core'

export const DEFAULT_AUDIO_OUTPUT_DEVICE_ID = 'default'

export async function applyAudioOutputDevice(
  mediaElement: HTMLMediaElement,
  deviceId: string
) {
  const element = mediaElement as SinkIdMediaElement

  if (!element.setSinkId) {
    if (deviceId && deviceId !== DEFAULT_AUDIO_OUTPUT_DEVICE_ID) {
      throw new Error('当前运行环境不支持切换音频输出设备。')
    }

    return
  }

  await element.setSinkId(deviceId || DEFAULT_AUDIO_OUTPUT_DEVICE_ID)
}
