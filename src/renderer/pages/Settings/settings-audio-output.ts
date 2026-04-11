import {
  applyAudioOutputDevice,
  DEFAULT_AUDIO_OUTPUT_DEVICE_ID,
} from '@/lib/audio-output'

export { applyAudioOutputDevice, DEFAULT_AUDIO_OUTPUT_DEVICE_ID }

export type AudioOutputDeviceQueryStatus =
  | 'ok'
  | 'empty'
  | 'unsupported'
  | 'permission-denied'
  | 'error'

export interface AudioOutputDeviceOption {
  deviceId: string
  label: string
  isDefault: boolean
}

export interface AudioOutputDeviceQueryResult {
  devices: AudioOutputDeviceOption[]
  status: AudioOutputDeviceQueryStatus
  message?: string
}

type WindowWithAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext
}

function getDeviceFallbackLabel(device: MediaDeviceInfo, index: number) {
  if (device.deviceId === DEFAULT_AUDIO_OUTPUT_DEVICE_ID) {
    return '系统默认输出设备'
  }

  return `输出设备 ${index + 1}`
}

function normalizeAudioOutputDevices(devices: MediaDeviceInfo[]) {
  const audioOutputDevices = devices.filter(
    device => device.kind === 'audiooutput'
  )

  const normalizedDevices = audioOutputDevices.map((device, index) => ({
    deviceId: device.deviceId,
    label: device.label || getDeviceFallbackLabel(device, index),
    isDefault: device.deviceId === DEFAULT_AUDIO_OUTPUT_DEVICE_ID,
  }))

  if (
    !normalizedDevices.some(
      device => device.deviceId === DEFAULT_AUDIO_OUTPUT_DEVICE_ID
    )
  ) {
    normalizedDevices.unshift({
      deviceId: DEFAULT_AUDIO_OUTPUT_DEVICE_ID,
      label: '系统默认输出设备',
      isDefault: true,
    })
  }

  return normalizedDevices
}

async function requestAudioDevicePermission() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  })

  stream.getTracks().forEach(track => track.stop())
}

export function mergeSelectedAudioOutputDevice(
  devices: AudioOutputDeviceOption[],
  selectedDeviceId: string
) {
  if (
    !selectedDeviceId ||
    devices.some(device => device.deviceId === selectedDeviceId)
  ) {
    return devices
  }

  return [
    ...devices,
    {
      deviceId: selectedDeviceId,
      label:
        selectedDeviceId === DEFAULT_AUDIO_OUTPUT_DEVICE_ID
          ? '系统默认输出设备'
          : '已选择的输出设备',
      isDefault: false,
    },
  ]
}

export async function queryAudioOutputDevices(): Promise<AudioOutputDeviceQueryResult> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return {
      devices: [],
      status: 'unsupported',
      message: '当前运行环境不支持读取音频输出设备。',
    }
  }

  try {
    let mediaDevices = await navigator.mediaDevices.enumerateDevices()

    if (
      mediaDevices.some(
        device => device.kind === 'audiooutput' && !device.label
      )
    ) {
      await requestAudioDevicePermission()
      mediaDevices = await navigator.mediaDevices.enumerateDevices()
    }

    const devices = normalizeAudioOutputDevices(mediaDevices)

    if (!devices.length) {
      return {
        devices,
        status: 'empty',
        message: '暂未读取到可用的音频输出设备。',
      }
    }

    return { devices, status: 'ok' }
  } catch (error) {
    const isPermissionDenied =
      error instanceof DOMException &&
      ['NotAllowedError', 'PermissionDeniedError'].includes(error.name)

    return {
      devices: [
        {
          deviceId: DEFAULT_AUDIO_OUTPUT_DEVICE_ID,
          label: '系统默认输出设备',
          isDefault: true,
        },
      ],
      status: isPermissionDenied ? 'permission-denied' : 'error',
      message: isPermissionDenied
        ? '未获得音频设备权限，暂时只能使用系统默认输出设备。'
        : '音频输出设备读取失败，请稍后重试。',
    }
  }
}

export async function playAudioOutputTestTone(deviceId: string) {
  const AudioContextConstructor =
    window.AudioContext || (window as WindowWithAudioContext).webkitAudioContext

  if (!AudioContextConstructor) {
    throw new Error('当前运行环境不支持播放测试音。')
  }

  const audioContext = new AudioContextConstructor()
  const destination = audioContext.createMediaStreamDestination()
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const audioElement = new Audio()

  audioElement.srcObject = destination.stream

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
  gain.gain.setValueAtTime(0.001, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.32)

  oscillator.connect(gain)
  gain.connect(destination)

  try {
    await applyAudioOutputDevice(audioElement, deviceId)
    await audioContext.resume()
    await audioElement.play()

    await new Promise<void>(resolve => {
      oscillator.addEventListener('ended', () => resolve(), { once: true })
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.35)
    })
  } finally {
    audioElement.pause()
    audioElement.srcObject = null
    destination.stream.getTracks().forEach(track => track.stop())
    oscillator.disconnect()
    gain.disconnect()
    await audioContext.close()
  }
}
