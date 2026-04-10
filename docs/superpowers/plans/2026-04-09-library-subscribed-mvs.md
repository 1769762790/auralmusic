# Library Subscribed MVs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the Library MV tab to `/mv/sublist` and load subscribed MVs lazily with infinite scroll.

**Architecture:** Keep the Library first-screen batch focused on tabs that must render immediately. Move subscribed-MV pagination into the MV tab component so the API boundary, normalization, and infinite-scroll lifecycle remain local to that tab.

**Tech Stack:** React 19, TypeScript, Axios service layer, project `useIntersectionLoadMore` hook.

---

### Task 1: Add a Tested Subscribed-MV Page Normalizer

**Files:**

- Create: `f:/code-demo/auralmusic/src/renderer/pages/Library/library-mvs.model.ts`
- Create: `f:/code-demo/auralmusic/library-mvs.model.test.ts`

- [ ] **Step 1: Write the failing test**

Write a Node test that imports `normalizeLibraryMvPage` and asserts nested response handling, MV mapping, and `hasMore` derivation.

- [ ] **Step 2: Run test to verify it fails**

Run: `node library-mvs.model.test.ts`
Expected: failure because `normalizeLibraryMvPage` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create a helper that:

- unwraps nested `data`
- converts raw MV items to `LibraryMvItem`
- derives `hasMore` from `more`, `hasMore`, or `count` vs `offset + list.length`

- [ ] **Step 4: Run test to verify it passes**

Run: `node library-mvs.model.test.ts`
Expected: `pass 3`, `fail 0`

### Task 2: Wire the Correct API Endpoint

**Files:**

- Modify: `f:/code-demo/auralmusic/src/renderer/api/mv.ts`

- [ ] **Step 1: Add the thin API function**

Add `getSubscribedMvs({ limit, offset })` that requests `/mv/sublist`.

- [ ] **Step 2: Keep request construction in the API layer**

Do not call `request.get('/mv/sublist')` directly from page files.

### Task 3: Move Library MVs to Lazy Infinite Loading

**Files:**

- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/index.tsx`
- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/library.model.ts`
- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/components/LibraryTabsSection.tsx`
- Modify: `f:/code-demo/auralmusic/src/renderer/pages/Library/components/LibraryMvPanel.tsx`

- [ ] **Step 1: Remove eager MV loading from the page container**

Delete the `getTopMvs()` request from `loadBaseData()` and remove `mvs` from `LibraryPageData`.

- [ ] **Step 2: Pass tab activity into the MV panel**

Update `LibraryTabsSection` so the MV tab renders:

```tsx
<LibraryMvPanel active={activeTab === 'mvs'} onOpen={onOpenMv} />
```

- [ ] **Step 3: Implement MV-tab local pagination**

Inside `LibraryMvPanel`:

- use `getSubscribedMvs`
- use `normalizeLibraryMvPage`
- use `useIntersectionLoadMore`
- bootstrap on first activation only
- preserve the existing card open handler

### Task 4: Verify

**Files:**

- Verify only

- [ ] **Step 1: Run regression test**

Run: `node library-mvs.model.test.ts`
Expected: `pass 3`, `fail 0`

- [ ] **Step 2: Run related regression test**

Run: `node library-artists.model.test.ts && node library-albums.model.test.ts`
Expected: both stay green after the shared Library changes.

- [ ] **Step 3: Run changed-file lint**

Run ESLint against the changed Library and MV source files. Report any repository-wide compile blockers separately.
