import Database from 'better-sqlite3'

import { createLocalMediaUrl } from '../../shared/local-media.ts'
import type {
  LocalLibraryAlbumRecord,
  LocalLibraryArtistRecord,
  LocalLibraryRootRecord,
  LocalLibrarySnapshot,
  LocalLibraryStats,
  LocalLibraryTrackRecord,
} from '../../shared/local-library.ts'

export interface LocalLibraryTrackUpsertInput {
  rootId: number
  filePath: string
  fileName: string
  title: string
  artistName: string
  albumName: string
  durationMs: number
  lyricText: string
  translatedLyricText: string
  coverPath: string | null
  fileSize: number
  mtimeMs: number
  audioFormat: string
  trackNo: number | null
  discNo: number | null
}

export interface LocalLibraryDatabaseOptions {
  dbPath: string
}

type BetterSqliteDatabase = InstanceType<typeof Database>

const SCHEMA_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS library_roots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      root_path TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS local_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      root_id INTEGER NOT NULL,
      file_path TEXT NOT NULL UNIQUE,
      file_name TEXT NOT NULL,
      title TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      album_name TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      lyric_text TEXT NOT NULL DEFAULT '',
      translated_lyric_text TEXT NOT NULL DEFAULT '',
      cover_path TEXT,
      file_size INTEGER NOT NULL,
      mtime_ms INTEGER NOT NULL,
      audio_format TEXT NOT NULL,
      track_no INTEGER,
      disc_no INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(root_id) REFERENCES library_roots(id) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS library_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `,
  `CREATE INDEX IF NOT EXISTS idx_local_tracks_root_id ON local_tracks(root_id)`,
  `CREATE INDEX IF NOT EXISTS idx_local_tracks_title ON local_tracks(title)`,
  `CREATE INDEX IF NOT EXISTS idx_local_tracks_artist_name ON local_tracks(artist_name)`,
  `CREATE INDEX IF NOT EXISTS idx_local_tracks_album_name ON local_tracks(album_name)`,
]

const LOCAL_TRACK_TEXT_COLUMNS = [
  "ALTER TABLE local_tracks ADD COLUMN lyric_text TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE local_tracks ADD COLUMN translated_lyric_text TEXT NOT NULL DEFAULT ''",
]

function toNullableLocalMediaUrl(coverPath: string | null) {
  return coverPath ? createLocalMediaUrl(coverPath) : ''
}

export class LocalLibraryDatabase {
  private readonly database: BetterSqliteDatabase

  constructor(options: LocalLibraryDatabaseOptions) {
    this.database = new Database(options.dbPath)
    this.database.pragma('foreign_keys = ON')

    for (const statement of SCHEMA_STATEMENTS) {
      this.database.exec(statement)
    }

    for (const statement of LOCAL_TRACK_TEXT_COLUMNS) {
      try {
        this.database.exec(statement)
      } catch {
        // 兼容已存在字段的旧库迁移，避免升级时因为重复加列中断本地乐库初始化。
      }
    }
  }

  close() {
    this.database.close()
  }

  replaceRoots(paths: string[]) {
    const currentRows = this.database
      .prepare(
        'SELECT id, root_path as path, created_at as createdAt FROM library_roots'
      )
      .all() as LocalLibraryRootRecord[]
    const currentPathSet = new Set(currentRows.map(row => row.path))
    const nextPathSet = new Set(paths)
    const now = Date.now()

    const insertRoot = this.database.prepare(
      'INSERT INTO library_roots (root_path, created_at) VALUES (?, ?)'
    )

    const deleteRoot = this.database.prepare(
      'DELETE FROM library_roots WHERE root_path = ?'
    )

    const syncRoots = this.database.transaction(() => {
      for (const path of paths) {
        if (!currentPathSet.has(path)) {
          insertRoot.run(path, now)
        }
      }

      for (const currentRow of currentRows) {
        if (!nextPathSet.has(currentRow.path)) {
          deleteRoot.run(currentRow.path)
        }
      }
    })

    syncRoots()

    return this.getRoots()
  }

  getRoots() {
    return this.database
      .prepare(
        'SELECT id, root_path as path, created_at as createdAt FROM library_roots ORDER BY root_path COLLATE NOCASE ASC'
      )
      .all() as LocalLibraryRootRecord[]
  }

  getTrackByFilePath(filePath: string) {
    const row = this.database
      .prepare(
        `
          SELECT
            id,
            root_id as rootId,
            file_path as filePath,
            file_name as fileName,
            title,
            artist_name as artistName,
            album_name as albumName,
            duration_ms as durationMs,
            lyric_text as lyricText,
            translated_lyric_text as translatedLyricText,
            cover_path as coverPath,
            file_size as fileSize,
            mtime_ms as mtimeMs,
            audio_format as audioFormat,
            track_no as trackNo,
            disc_no as discNo
          FROM local_tracks
          WHERE file_path = ?
        `
      )
      .get(filePath) as Omit<LocalLibraryTrackRecord, 'coverUrl'> | undefined

    if (!row) {
      return null
    }

    return {
      ...row,
      coverUrl: toNullableLocalMediaUrl(row.coverPath),
    } satisfies LocalLibraryTrackRecord
  }

  upsertTrack(input: LocalLibraryTrackUpsertInput) {
    const now = Date.now()

    this.database
      .prepare(
        `
          INSERT INTO local_tracks (
            root_id,
            file_path,
            file_name,
            title,
            artist_name,
            album_name,
            duration_ms,
            lyric_text,
            translated_lyric_text,
            cover_path,
            file_size,
            mtime_ms,
            audio_format,
            track_no,
            disc_no,
            created_at,
            updated_at
          ) VALUES (
            @rootId,
            @filePath,
            @fileName,
            @title,
            @artistName,
            @albumName,
            @durationMs,
            @lyricText,
            @translatedLyricText,
            @coverPath,
            @fileSize,
            @mtimeMs,
            @audioFormat,
            @trackNo,
            @discNo,
            @createdAt,
            @updatedAt
          )
          ON CONFLICT(file_path) DO UPDATE SET
            root_id = excluded.root_id,
            file_name = excluded.file_name,
            title = excluded.title,
            artist_name = excluded.artist_name,
            album_name = excluded.album_name,
            duration_ms = excluded.duration_ms,
            lyric_text = excluded.lyric_text,
            translated_lyric_text = excluded.translated_lyric_text,
            cover_path = excluded.cover_path,
            file_size = excluded.file_size,
            mtime_ms = excluded.mtime_ms,
            audio_format = excluded.audio_format,
            track_no = excluded.track_no,
            disc_no = excluded.disc_no,
            updated_at = excluded.updated_at
        `
      )
      .run({
        ...input,
        createdAt: now,
        updatedAt: now,
      })
  }

  updateTrackSupplementalMetadata(input: {
    filePath: string
    lyricText: string
    translatedLyricText: string
    coverPath: string | null
  }) {
    this.database
      .prepare(
        `
          UPDATE local_tracks
          SET
            lyric_text = @lyricText,
            translated_lyric_text = @translatedLyricText,
            cover_path = COALESCE(@coverPath, cover_path),
            updated_at = @updatedAt
          WHERE file_path = @filePath
        `
      )
      .run({
        ...input,
        updatedAt: Date.now(),
      })
  }

  removeTrackByFilePath(filePath: string) {
    const result = this.database
      .prepare('DELETE FROM local_tracks WHERE file_path = ?')
      .run(filePath)

    return result.changes > 0
  }

  removeTracksMissingFromRoot(rootId: number, existingFilePaths: string[]) {
    if (existingFilePaths.length === 0) {
      this.database
        .prepare('DELETE FROM local_tracks WHERE root_id = ?')
        .run(rootId)
      return
    }

    const placeholders = existingFilePaths.map(() => '?').join(', ')
    this.database
      .prepare(
        `DELETE FROM local_tracks WHERE root_id = ? AND file_path NOT IN (${placeholders})`
      )
      .run(rootId, ...existingFilePaths)
  }

  setLastScannedAt(timestamp: number) {
    this.database
      .prepare(
        `
          INSERT INTO library_meta (key, value)
          VALUES ('lastScannedAt', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `
      )
      .run(String(timestamp))
  }

  getSnapshot(): LocalLibrarySnapshot {
    const roots = this.getRoots()
    const tracks = this.database
      .prepare(
        `
          SELECT
            id,
            root_id as rootId,
            file_path as filePath,
            file_name as fileName,
            title,
            artist_name as artistName,
            album_name as albumName,
            duration_ms as durationMs,
            lyric_text as lyricText,
            translated_lyric_text as translatedLyricText,
            cover_path as coverPath,
            file_size as fileSize,
            mtime_ms as mtimeMs,
            audio_format as audioFormat,
            track_no as trackNo,
            disc_no as discNo
          FROM local_tracks
          ORDER BY title COLLATE NOCASE ASC, file_path COLLATE NOCASE ASC
        `
      )
      .all()
      .map(row => {
        const trackRow = row as Omit<LocalLibraryTrackRecord, 'coverUrl'>
        return {
          ...trackRow,
          coverUrl: toNullableLocalMediaUrl(trackRow.coverPath),
        }
      }) as LocalLibraryTrackRecord[]

    const albums = this.database
      .prepare(
        `
          SELECT
            MIN(id) as id,
            album_name as name,
            artist_name as artistName,
            COUNT(*) as trackCount,
            MAX(COALESCE(cover_path, '')) as coverPath
          FROM local_tracks
          GROUP BY album_name, artist_name
          ORDER BY album_name COLLATE NOCASE ASC, artist_name COLLATE NOCASE ASC
        `
      )
      .all()
      .map(row => {
        const typedRow = row as {
          id: number
          name: string
          artistName: string
          trackCount: number
          coverPath: string
        }

        return {
          id: typedRow.id,
          name: typedRow.name,
          artistName: typedRow.artistName,
          trackCount: typedRow.trackCount,
          coverUrl: toNullableLocalMediaUrl(typedRow.coverPath || null),
        }
      }) as LocalLibraryAlbumRecord[]

    const artists = this.database
      .prepare(
        `
          SELECT
            MIN(id) as id,
            artist_name as name,
            COUNT(*) as trackCount,
            MAX(COALESCE(cover_path, '')) as coverPath
          FROM local_tracks
          GROUP BY artist_name
          ORDER BY artist_name COLLATE NOCASE ASC
        `
      )
      .all()
      .map(row => {
        const typedRow = row as {
          id: number
          name: string
          trackCount: number
          coverPath: string
        }

        return {
          id: typedRow.id,
          name: typedRow.name,
          trackCount: typedRow.trackCount,
          coverUrl: toNullableLocalMediaUrl(typedRow.coverPath || null),
        }
      }) as LocalLibraryArtistRecord[]

    const lastScannedAtRow = this.database
      .prepare("SELECT value FROM library_meta WHERE key = 'lastScannedAt'")
      .get() as { value?: string } | undefined

    const stats: LocalLibraryStats = {
      rootCount: roots.length,
      trackCount: tracks.length,
      albumCount: albums.length,
      artistCount: artists.length,
      lastScannedAt:
        lastScannedAtRow?.value &&
        Number.isFinite(Number(lastScannedAtRow.value))
          ? Number(lastScannedAtRow.value)
          : null,
    }

    return {
      roots,
      stats,
      tracks,
      albums,
      artists,
    }
  }
}

export function createLocalLibraryDatabase(
  options: LocalLibraryDatabaseOptions
) {
  return new LocalLibraryDatabase(options)
}
