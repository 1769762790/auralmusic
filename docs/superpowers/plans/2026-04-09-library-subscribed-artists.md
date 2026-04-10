# Library Subscribed Artists Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the Library artists tab to `/artist/sublist` and load subscribed artists lazily with infinite scroll.

**Architecture:** Keep the Library page eager batch focused on first-screen tabs only. Move subscribed-artists pagination into a tab-local container so the API boundary, pagination state, and UI sentinel stay together. Reuse the existing intersection-based load-more hook rather than inventing a second pagination pattern.

**Tech Stack:** React 19, TypeScript, Axios service layer, Zustand auth state, project `useIntersectionLoadMore` hook.

---

### Task 1: Add a Tested Subscribed-Artists Page Normalizer

**Files:**

- Create: `f:/code-demo/auralmusic/src/renderer/pages/Library/library-artists.model.ts`
- Create: `f:/code-demo/auralmusic/library-artists.model.test.ts`

- [ ] **Step 1: Write the failing test**

Write a Node test that imports `normalizeLibraryArtistPage` and asserts:

```ts
const page = normalizeLibraryArtistPage(
  {
    data: {
      data: {
        artists: [{ id: 1, name: 'A', picUrl: 'x' }],
        count: 40,
      },
    },
  },
  { limit: 25, offset: 0 }
)

assert.equal(page.list.length, 1)
assert.equal(page.hasMore, true)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node library-artists.model.test.ts`
Expected: failure because `normalizeLibraryArtistPage` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create a focused helper that:

- unwraps nested `data`
- converts raw artist items to `ArtistListItem`
- derives `hasMore` from `more`, `hasMore`, or `count` vs `offset + list.length`

- [ ] **Step 4: Run test to verify it passes**

Run: `node library-artists.model.test.ts`
Expected: `pass 3`, `fail 0`

### Task 2: Wire the Correct API Endpoint

**Files:**

- Modify: `f:/code-demo/auralmusic/src/renderer/api/artist.ts`

- [ ] **Step 1: Add the thin API function**

Add:

```ts
export interface SubscribedArtistListParams {
  limit?: number
  offset?: number
}

export function getSubscribedArtists(params: SubscribedArtistListParams) {
  return request.get('/artist/sublist', {
    params,
  })
}
```

- [ ] **Step 2: Keep request construction in the API layer only**

Do not call `request.get('/artist/sublist')` from page files after this point.

### Task 3: Move Library Artists to Lazy Infinite Loading

**Files:**

- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/index.tsx`
- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/library.model.ts`
- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/components/LibraryTabsSection.tsx`
- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/components/LibraryArtistPanel.tsx`

- [ ] **Step 1: Remove eager artists loading from the page container**

Delete the `getTopArtists()` request from `loadBaseData()` and remove `artists` from `LibraryPageData`.

- [ ] **Step 2: Pass only tab activity into the artists panel**

Update `LibraryTabsSection` so the artists tab renders:

```tsx
<LibraryArtistPanel active={activeTab === 'artists'} />
```

- [ ] **Step 3: Implement artists-tab local pagination**

Inside `LibraryArtistPanel`:

- use `getSubscribedArtists`
- use `normalizeLibraryArtistPage`
- use `useIntersectionLoadMore`
- bootstrap with `reset()` only on the first activation
- render grid, empty state, and sentinel footer

- [ ] **Step 4: Keep UI scope local**

Do not add new Zustand state or page-wide error banners for this tab-only concern.

### Task 4: Verify

**Files:**

- Verify only

- [ ] **Step 1: Run regression test**

Run: `node library-artists.model.test.ts`
Expected: `pass 3`, `fail 0`

- [ ] **Step 2: Run focused TypeScript verification**

Run: `node_modules\\.bin\\tsc.cmd -p tsconfig.app.json --pretty false`

Expected: if unrelated existing renderer errors still block the full app compile, report them explicitly and separate them from this change.
