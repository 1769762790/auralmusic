export function resolveQuitAndInstallOptions(platform: NodeJS.Platform) {
  return {
    isSilent: platform === 'win32',
    isForceRunAfter: true,
  }
}
