import electron from 'electron'

const { app } = electron

export type UserDataPathGetter = (name: 'userData') => string

export function resolveAppStoreDirectory(
  appGetPath: UserDataPathGetter = name => app.getPath(name)
) {
  const directory = appGetPath('userData')

  if (typeof directory !== 'string' || !directory.trim()) {
    throw new Error('Failed to resolve Electron userData directory')
  }

  return directory
}
