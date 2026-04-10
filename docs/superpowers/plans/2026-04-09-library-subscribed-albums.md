# Library Subscribed Albums Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the Library albums tab to `/album/sublist` and load subscribed albums lazily with infinite scroll.

**Architecture:** Keep first-screen Library data focused on the tabs that must render immediately. Move subscribed-album pagination into the albums tab component so the API boundary, normalization, and infinite-scroll behavior stay local to that tab.

**Tech Stack:** React 19, TypeScript, Axios service layer, project `useIntersectionLoadMore` hook.

---

### Task 1: Add a Tested Subscribed-Albums Page Normalizer

**Files:**

- Create: `f:/code-demo/auralmusic/src/renderer/pages/Library/library-albums.model.ts`
- Create: `f:/code-demo/auralmusic/library-albums.model.test.ts`

- [ ] **Step 1: Write the failing test**

Write a Node test that imports `normalizeLibraryAlbumPage` and asserts nested response handling, album mapping, and `hasMore` derivation.

- [ ] **Step 2: Run test to verify it fails**

Run: `node library-albums.model.test.ts`
Expected: failure because `normalizeLibraryAlbumPage` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create a helper that:

- unwraps nested `data`
- converts raw album items to `AlbumListItem`
- derives `hasMore` from `more`, `hasMore`, or `count` vs `offset + list.length`

- [ ] **Step 4: Run test to verify it passes**

Run: `node library-albums.model.test.ts`
Expected: `pass 3`, `fail 0`

### Task 2: Wire the Correct API Endpoint

**Files:**

- Modify: `f:/code-demo/auralmusic/src/renderer/api/album.ts`

- [ ] **Step 1: Add the thin API function**

Add `getSubscribedAlbums({ limit, offset })` that requests `/album/sublist`.

- [ ] **Step 2: Keep request construction in the API layer**

Do not call `request.get('/album/sublist')` directly from page files.

### Task 3: Move Library Albums to Lazy Infinite Loading

**Files:**

- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/index.tsx`
- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/library.model.ts`
- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/components/LibraryTabsSection.tsx`
- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/components/LibraryAlbumPanel.tsx`

- [ ] **Step 1: Remove eager albums loading from the page container**

Delete the `getNewAlbums()` request from `loadBaseData()` and remove `albums` from `LibraryPageData`.

- [ ] **Step 2: Pass tab activity into the albums panel**

Update `LibraryTabsSection` so the albums tab renders:

```tsx
<LibraryAlbumPanel active={activeTab === 'albums'} />
```

- [ ] **Step 3: Implement albums-tab local pagination**

Inside `LibraryAlbumPanel`:

- use `getSubscribedAlbums`
- use `normalizeLibraryAlbumPage`
- use `useIntersectionLoadMore`
- bootstrap on first activation only
- preserve album card navigation

### Task 4: Verify

**Files:**

- Verify only

- [ ] **Step 1: Run regression test**

Run: `node library-albums.model.test.ts`
Expected: `pass 3`, `fail 0`

- [ ] **Step 2: Run changed-file lint**

Run ESLint against the changed Library and album source files. Report any repository-wide compile blockers separately.
