# Liked Songs Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated liked songs detail page at `/library/liked-songs`, load the current user's liked songs automatically from `getLikeList`, and wire the Library hero card so the full card opens this page.

**Architecture:** Add a focused `LikedSongs` page under `src/renderer/pages` with its own model and hero component, but reuse the existing daily-song row/list presentation to avoid duplicating table UI. Keep the data pipeline explicit and local to the new page: `getLikeList(uid)` for ids, `getSongDetail(ids)` for details, then normalize into row items for rendering.

**Tech Stack:** React, React Router, TypeScript, zustand auth store, existing renderer API layer, node:test, ESLint

---

## File Map

- Create: `src/renderer/pages/LikedSongs/index.tsx`
  Page container for auth-aware liked songs loading, loading/error/empty rendering, and hero + list composition.
- Create: `src/renderer/pages/LikedSongs/liked-songs.model.ts`
  Local page state, empty state, and composition helpers that turn `getLikeList` + `getSongDetail` responses into row data.
- Create: `src/renderer/pages/LikedSongs/components/LikedSongsHero.tsx`
  Lightweight header for the liked songs page.
- Create: `liked-songs.model.test.ts`
  Regression tests for the page model.
- Modify: `src/renderer/router/router.config.tsx`
  Register `/library/liked-songs`.
- Modify: `src/renderer/pages/Library/components/LibraryHero.tsx`
  Make the whole card clickable and align the play button destination with it.
- Modify: `src/renderer/pages/Library/index.tsx`
  Change the Library hero callback to route to the new page instead of `/daily-songs`.

### Task 1: Add the failing model test

**Files:**

- Create: `liked-songs.model.test.ts`
- Test: `liked-songs.model.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  EMPTY_LIKED_SONGS_PAGE_STATE,
  resolveLikedSongsPageState,
} from './src/renderer/pages/LikedSongs/liked-songs.model.ts'

test('resolveLikedSongsPageState composes liked ids with song detail rows', () => {
  const state = resolveLikedSongsPageState(
    {
      data: {
        ids: [11, 22],
      },
    },
    {
      data: {
        songs: [
          {
            id: 11,
            name: 'Northern Lights',
            dt: 245000,
            ar: [{ name: 'Aurora Echo' }],
            al: {
              name: 'Midnight Signals',
              picUrl: 'https://img.example.com/a.jpg',
            },
          },
          {
            id: 22,
            name: 'Night Drive',
            dt: 215000,
            ar: [{ name: 'Night Pulse' }],
            al: {
              name: 'Moonline',
              picUrl: 'https://img.example.com/b.jpg',
            },
          },
        ],
      },
    }
  )

  assert.deepEqual(state, {
    totalSongs: 2,
    songs: [
      {
        id: 11,
        name: 'Northern Lights',
        artistNames: 'Aurora Echo',
        albumName: 'Midnight Signals',
        coverUrl: 'https://img.example.com/a.jpg',
        duration: 245000,
      },
      {
        id: 22,
        name: 'Night Drive',
        artistNames: 'Night Pulse',
        albumName: 'Moonline',
        coverUrl: 'https://img.example.com/b.jpg',
        duration: 215000,
      },
    ],
  })
})

test('resolveLikedSongsPageState returns empty list when liked ids are empty', () => {
  const state = resolveLikedSongsPageState(
    {
      data: {
        ids: [],
      },
    },
    {
      data: {
        songs: [
          {
            id: 99,
            name: 'Unused song',
          },
        ],
      },
    }
  )

  assert.deepEqual(state, EMPTY_LIKED_SONGS_PAGE_STATE)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node liked-songs.model.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/renderer/pages/LikedSongs/liked-songs.model.ts`

- [ ] **Step 3: Commit**

```bash
git add liked-songs.model.test.ts
git commit -m "test: add liked songs page model coverage"
```

### Task 2: Implement the liked songs model

**Files:**

- Create: `src/renderer/pages/LikedSongs/liked-songs.model.ts`
- Test: `liked-songs.model.test.ts`

- [ ] **Step 1: Write the minimal model implementation**

```ts
import type { DailySongRowItem } from '@/pages/DailySongs/daily-songs.model'
import {
  normalizeLibrarySongs,
  resolveLibraryLikedSongIds,
} from '@/pages/Library/library.model'

export interface LikedSongsPageState {
  totalSongs: number
  songs: DailySongRowItem[]
}

export const EMPTY_LIKED_SONGS_PAGE_STATE: LikedSongsPageState = {
  totalSongs: 0,
  songs: [],
}

export function resolveLikedSongsPageState(
  likeListResponse: unknown,
  songDetailResponse: unknown
): LikedSongsPageState {
  const likedSongIds = resolveLibraryLikedSongIds(likeListResponse)

  if (!likedSongIds.length) {
    return EMPTY_LIKED_SONGS_PAGE_STATE
  }

  return {
    totalSongs: likedSongIds.length,
    songs: normalizeLibrarySongs(songDetailResponse),
  }
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node liked-songs.model.test.ts`

Expected: PASS with 2 passing tests

- [ ] **Step 3: Commit**

```bash
git add liked-songs.model.test.ts src/renderer/pages/LikedSongs/liked-songs.model.ts
git commit -m "feat: add liked songs page model"
```

### Task 3: Add the page UI and route

**Files:**

- Create: `src/renderer/pages/LikedSongs/components/LikedSongsHero.tsx`
- Create: `src/renderer/pages/LikedSongs/index.tsx`
- Modify: `src/renderer/router/router.config.tsx`

- [ ] **Step 1: Add the page hero component**

```tsx
interface LikedSongsHeroProps {
  totalSongs: number
}

const LikedSongsHero = ({ totalSongs }: LikedSongsHeroProps) => {
  return (
    <section className='relative flex flex-col items-center justify-center px-6 pt-14 pb-10 text-center md:pt-20 md:pb-14'>
      <div className='max-w-4xl space-y-5'>
        <h1 className='text-[clamp(3rem,8vw,5.8rem)] leading-[0.95] font-black text-sky-600'>
          我喜欢的音乐
        </h1>
        <p className='text-sm text-neutral-700/90 md:text-[17px]'>
          收藏过的歌都收在这里，进入页面后自动加载完整列表
        </p>
        <p className='text-xs tracking-[0.22em] text-neutral-400 uppercase'>
          Liked songs · {totalSongs} tracks
        </p>
      </div>
    </section>
  )
}

export default LikedSongsHero
```

- [ ] **Step 2: Add the page container**

```tsx
import { useEffect, useState } from 'react'

import { getLikeList, getSongDetail } from '@/api/list'
import DailySongsList from '@/pages/DailySongs/components/DailySongsList'
import DailySongsSkeleton from '@/pages/DailySongs/components/DailySongsSkeleton'
import LibraryLockedState from '@/pages/Library/components/LibraryLockedState'
import { useAuthStore } from '@/stores/auth-store'

import LikedSongsHero from './components/LikedSongsHero'
import {
  EMPTY_LIKED_SONGS_PAGE_STATE,
  resolveLikedSongsPageState,
  type LikedSongsPageState,
} from './liked-songs.model'

const LikedSongs = () => {
  const user = useAuthStore(state => state.user)
  const loginStatus = useAuthStore(state => state.loginStatus)
  const hasHydrated = useAuthStore(state => state.hasHydrated)

  const [state, setState] = useState<LikedSongsPageState>(
    EMPTY_LIKED_SONGS_PAGE_STATE
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAuthenticated =
    hasHydrated && loginStatus === 'authenticated' && Boolean(user?.userId)

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setState(EMPTY_LIKED_SONGS_PAGE_STATE)
      setLoading(false)
      setError('')
      return
    }

    let isActive = true

    const fetchLikedSongs = async () => {
      setLoading(true)
      setError('')
      setState(EMPTY_LIKED_SONGS_PAGE_STATE)

      try {
        const likeListResponse = await getLikeList(user.userId)
        const likeIds =
          likeListResponse.data?.ids || likeListResponse.data?.data?.ids || []

        if (!isActive) {
          return
        }

        if (!Array.isArray(likeIds) || likeIds.length === 0) {
          setState(EMPTY_LIKED_SONGS_PAGE_STATE)
          return
        }

        const songDetailResponse = await getSongDetail(likeIds)

        if (!isActive) {
          return
        }

        setState(
          resolveLikedSongsPageState(
            likeListResponse.data,
            songDetailResponse.data
          )
        )
      } catch (fetchError) {
        if (!isActive) {
          return
        }

        console.error('liked songs fetch failed', fetchError)
        setError('我喜欢的音乐加载失败，请稍后重试')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void fetchLikedSongs()

    return () => {
      isActive = false
    }
  }, [isAuthenticated, user?.userId])

  if (!hasHydrated) {
    return <DailySongsSkeleton />
  }

  if (!isAuthenticated) {
    return <LibraryLockedState />
  }

  return (
    <section className='relative isolate min-h-full overflow-hidden pb-8'>
      <LikedSongsHero totalSongs={state.totalSongs} />

      {loading && state.songs.length === 0 ? (
        <DailySongsSkeleton />
      ) : error && state.songs.length === 0 ? (
        <div className='mx-auto px-4 pb-10 md:px-6'>
          <div className='px-6 py-12 text-center text-sm'>{error}</div>
        </div>
      ) : (
        <DailySongsList songs={state.songs} />
      )}
    </section>
  )
}

export default LikedSongs
```

- [ ] **Step 3: Register the route**

```tsx
import LikedSongs from '@/pages/LikedSongs'

{
  path: '/library/liked-songs',
  element: <LikedSongs />,
  meta: { title: '我喜欢的音乐', icon: '', hidden: true, authOnly: true },
}
```

- [ ] **Step 4: Run the model test again**

Run: `node liked-songs.model.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/renderer/pages/LikedSongs src/renderer/router/router.config.tsx
git commit -m "feat: add liked songs detail page"
```

### Task 4: Wire the Library hero entry and validate the flow

**Files:**

- Modify: `src/renderer/pages/Library/components/LibraryHero.tsx`
- Modify: `src/renderer/pages/Library/index.tsx`
- Test: `liked-songs.model.test.ts`

- [ ] **Step 1: Make the full Library hero card clickable**

```tsx
interface LibraryHeroProps {
  songs: LibrarySongItem[]
  songCount: number
  onOpenLikedSongs: () => void
}

<div
  role='button'
  tabIndex={0}
  className='group relative min-h-[240px] cursor-pointer overflow-hidden rounded-[32px] border border-[#d8e4ff] p-6'
  onClick={onOpenLikedSongs}
  onKeyDown={event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpenLikedSongs()
    }
  }}
>
```

- [ ] **Step 2: Align the button destination in Library**

```tsx
const handleOpenLikedSongs = () => {
  navigate('/library/liked-songs')
}

;<LibraryHero
  songs={data.likedSongs}
  songCount={data.likedSongCount}
  onOpenLikedSongs={handleOpenLikedSongs}
/>
```

- [ ] **Step 3: Run targeted verification**

Run: `node liked-songs.model.test.ts`

Expected: PASS

Run: `node_modules\\.bin\\eslint.cmd src/renderer/pages/LikedSongs/index.tsx src/renderer/pages/LikedSongs/liked-songs.model.ts src/renderer/pages/LikedSongs/components/LikedSongsHero.tsx src/renderer/pages/Library/components/LibraryHero.tsx src/renderer/pages/Library/index.tsx src/renderer/router/router.config.tsx`

Expected: exit code 0

- [ ] **Step 4: Commit**

```bash
git add src/renderer/pages/Library/components/LibraryHero.tsx src/renderer/pages/Library/index.tsx src/renderer/router/router.config.tsx
git commit -m "feat: connect library liked songs entry"
```

## Self-Review

- Spec coverage check:
  - New route: covered in Task 3
  - New page container: covered in Task 3
  - Model and normalization: covered in Tasks 1-2
  - Full-card Library click behavior: covered in Task 4
  - Automatic loading and error/empty state: covered in Task 3
- Placeholder scan:
  - No `TODO`/`TBD`
  - Commands and file paths are explicit
- Type consistency:
  - `LikedSongsPageState`, `resolveLikedSongsPageState`, and `onOpenLikedSongs` naming is consistent across tasks
