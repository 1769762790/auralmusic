import assert from 'node:assert/strict'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { DownloadService } from '../src/main/download/download-service.ts'
import type { DownloadTask } from '../src/main/download/download-types.ts'

function createNowSequence(start = 1_000) {
  let current = start
  return () => {
    current += 1
    return current
  }
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve
    reject = nextReject
  })

  return { promise, resolve, reject }
}

async function waitForTaskStatus(
  service: DownloadService,
  taskId: string,
  expectedStatus: DownloadTask['status']
) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const task = service.getTasks().find(item => item.id === taskId)
    if (task?.status === expectedStatus) {
      return task
    }

    await new Promise(resolve => setTimeout(resolve, 10))
  }

  assert.fail(`Task ${taskId} did not reach status ${expectedStatus}`)
}

test('DownloadService resolves the project downloads directory when config dir is empty', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'auralmusic-download-test-'))
  const service = new DownloadService({
    defaultRootDir: root,
    now: createNowSequence(),
  })

  assert.equal(service.getDefaultDirectory(''), root)
  assert.equal(service.getDefaultDirectory('   '), root)
  assert.equal(
    service.getDefaultDirectory(path.join(root, 'custom-downloads')),
    path.join(root, 'custom-downloads')
  )

  await rm(root, { recursive: true, force: true })
})

test('DownloadService falls down the quality chain and completes an mp3 download', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'auralmusic-download-test-'))
  const attemptedQualities: string[] = []
  const embeddedFiles: string[] = []
  const service = new DownloadService({
    defaultRootDir: root,
    now: createNowSequence(),
    createTaskId: () => 'task-quality-fallback',
    resolveSongUrl: async ({ quality }) => {
      attemptedQualities.push(quality)
      if (quality === 'sky') {
        return {
          url: 'https://cdn.example.com/song.mp3',
        }
      }

      return null
    },
    downloadFetcher: async () => {
      return new Response(Buffer.from('audio-data'), {
        status: 200,
        headers: {
          'content-type': 'audio/mpeg',
          'content-length': '10',
        },
      })
    },
    embedMetadata: async input => {
      embeddedFiles.push(input.filePath)
      return { applied: true }
    },
  })

  const task = await service.enqueueSongDownload({
    songId: '1',
    songName: 'Test Song',
    artistName: 'Test Artist',
    requestedQuality: 'jymaster',
    metadata: {
      albumName: 'Test Album',
      coverUrl: 'https://cdn.example.com/cover.jpg',
    },
  })

  const completed = await waitForTaskStatus(service, task.id, 'completed')
  const fileContent = await readFile(completed.targetPath, 'utf8')

  assert.deepEqual(attemptedQualities, ['jymaster', 'dolby', 'sky'])
  assert.equal(completed.requestedQuality, 'jymaster')
  assert.equal(completed.resolvedQuality, 'sky')
  assert.equal(completed.progress, 100)
  assert.match(completed.note ?? '', /downgraded/i)
  assert.equal(completed.warningMessage, null)
  assert.ok(completed.completedAt)
  assert.equal(fileContent, 'audio-data')
  assert.deepEqual(embeddedFiles, [completed.targetPath])

  await rm(root, { recursive: true, force: true })
})

test('DownloadService skips same-name files that already exist', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'auralmusic-download-test-'))
  const existingPath = path.join(root, 'existing-track.mp3')
  let fetchCount = 0
  const service = new DownloadService({
    defaultRootDir: root,
    now: createNowSequence(),
    createTaskId: () => 'task-same-name-skip',
    resolveSongUrl: async () => ({
      url: 'https://cdn.example.com/existing-track.mp3',
    }),
    downloadFetcher: async () => {
      fetchCount += 1
      return new Response(Buffer.from('new-audio'), {
        status: 200,
        headers: {
          'content-type': 'audio/mpeg',
        },
      })
    },
  })

  await writeFile(existingPath, 'original-audio', 'utf8')

  const task = await service.enqueueSongDownload({
    songId: '2',
    songName: 'Ignored Song',
    artistName: 'Ignored Artist',
    fileName: 'existing-track.mp3',
    requestedQuality: 'higher',
  })

  const skipped = await waitForTaskStatus(service, task.id, 'skipped')

  assert.equal(skipped.targetPath, existingPath)
  assert.equal(skipped.progress, 100)
  assert.match(skipped.warningMessage ?? '', /already exists/i)
  assert.equal(fetchCount, 0)

  await rm(root, { recursive: true, force: true })
})

test('DownloadService completes unsupported formats and reports metadata embedding skip', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'auralmusic-download-test-'))
  const service = new DownloadService({
    defaultRootDir: root,
    now: createNowSequence(),
    createTaskId: () => 'task-unsupported-metadata',
    resolveSongUrl: async () => ({
      url: 'https://cdn.example.com/song.flac',
    }),
    downloadFetcher: async () => {
      return new Response(Buffer.from('lossless-audio'), {
        status: 200,
        headers: {
          'content-type': 'audio/flac',
        },
      })
    },
  })

  const task = await service.enqueueSongDownload({
    songId: '3',
    songName: 'Lossless Song',
    artistName: 'Test Artist',
    requestedQuality: 'lossless',
    metadata: {
      coverUrl: 'https://cdn.example.com/cover.jpg',
      lyric: '[00:00.00]line',
    },
  })

  const completed = await waitForTaskStatus(service, task.id, 'completed')

  assert.ok(completed.targetPath.endsWith('.flac'))
  assert.match(completed.warningMessage ?? '', /metadata/i)
  assert.equal(completed.resolvedQuality, 'lossless')
  await access(completed.targetPath)

  await rm(root, { recursive: true, force: true })
})

test('DownloadService respects concurrency and can remove queued tasks before they start', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'auralmusic-download-test-'))
  const firstResponseGate = createDeferred<void>()
  const fetchedUrls: string[] = []
  const service = new DownloadService({
    defaultRootDir: root,
    now: createNowSequence(),
    concurrency: 1,
    createTaskId: (() => {
      let index = 0
      return () => {
        index += 1
        return `task-${index}`
      }
    })(),
    resolveSongUrl: async ({ songId }) => ({
      url: `https://cdn.example.com/${songId}.mp3`,
    }),
    downloadFetcher: async input => {
      const url = typeof input === 'string' ? input : input.toString()
      fetchedUrls.push(url)
      if (url.endsWith('/first.mp3')) {
        await firstResponseGate.promise
      }

      return new Response(Buffer.from(url), {
        status: 200,
        headers: {
          'content-type': 'audio/mpeg',
        },
      })
    },
  })

  const firstTask = await service.enqueueSongDownload({
    songId: 'first',
    songName: 'First Song',
    artistName: 'Artist',
    requestedQuality: 'higher',
  })
  const secondTask = await service.enqueueSongDownload({
    songId: 'second',
    songName: 'Second Song',
    artistName: 'Artist',
    requestedQuality: 'higher',
  })

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const first = service.getTasks().find(item => item.id === firstTask.id)
    const second = service.getTasks().find(item => item.id === secondTask.id)
    if (first?.status === 'downloading' && second?.status === 'queued') {
      break
    }

    await new Promise(resolve => setTimeout(resolve, 10))
  }

  assert.equal(service.removeTask(secondTask.id), true)
  assert.equal(
    service.getTasks().some(item => item.id === secondTask.id),
    false
  )

  firstResponseGate.resolve()

  await waitForTaskStatus(service, firstTask.id, 'completed')
  assert.deepEqual(fetchedUrls, ['https://cdn.example.com/first.mp3'])

  await rm(root, { recursive: true, force: true })
})
