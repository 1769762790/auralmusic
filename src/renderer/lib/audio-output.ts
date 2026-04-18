import type { SinkIdMediaElement } from '@/types/core'

export const DEFAULT_AUDIO_OUTPUT_DEVICE_ID = 'default'

export async function applyAudioOutputDevice(
  mediaElement: HTMLMediaElement,
  deviceId: string
) {
  const element = mediaElement as SinkIdMediaElement

  if (!element.setSinkId) {
    if (deviceId && deviceId !== DEFAULT_AUDIO_OUTPUT_DEVICE_ID) {
      throw new Error('褰撳墠杩愯鐜涓嶆敮鎸佸垏鎹㈤煶棰戣緭鍑鸿澶囥€?')
    }

    return
  }

  await element.setSinkId(deviceId || DEFAULT_AUDIO_OUTPUT_DEVICE_ID)
}
