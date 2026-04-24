import type { LocalLibrarySnapshot } from '../../shared/local-library.ts'
import type { LocalLibraryDatabase } from './db.ts'

export function getLocalLibrarySnapshot(
  database: LocalLibraryDatabase
): LocalLibrarySnapshot {
  return database.getSnapshot()
}
