# Albums Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `Albums` page backed by `/album/new` with area filters and infinite paging.

**Architecture:** Keep the feature inside `src/renderer/pages/Albums`, add a thin API wrapper in `src/renderer/api/album.ts`, and reuse `useIntersectionLoadMore` for first-load and pagination behavior. Update route and navigation wiring so the page is reachable from the sidebar.

**Tech Stack:** React, TypeScript, React Router, Tailwind CSS, axios request wrapper

---

### Task 1: Albums Data Contract

**Files:**

- Modify: `src/renderer/api/album.ts`
- Create: `src/renderer/pages/Albums/albums.model.ts`

- [ ] Add `/album/new` API wrapper with typed params
- [ ] Add album item model and area filter options

### Task 2: Albums UI

**Files:**

- Create: `src/renderer/pages/Albums/index.tsx`
- Create: `src/renderer/pages/Albums/components/AlbumCard.tsx`
- Create: `src/renderer/pages/Albums/components/AlbumsSkeletons.tsx`

- [ ] Build the page container with area state and list fetching
- [ ] Add a presentational card for album cover, title, and artist
- [ ] Add first-load skeleton grid

### Task 3: App Wiring

**Files:**

- Modify: `src/renderer/router/router.config.tsx`
- Modify: `src/renderer/components/NavBar/menu.config.ts`
- Modify: `src/renderer/pages/Home/components/NewAlbumList.tsx`

- [ ] Register `/albums`
- [ ] Point sidebar Albums entry to `/albums`
- [ ] Update Home "more" link to `/albums`

### Task 4: Verification

**Files:**

- Test: `src/renderer/api/album.ts`
- Test: `src/renderer/pages/Albums/index.tsx`
- Test: `src/renderer/components/NavBar/menu.config.ts`
- Test: `src/renderer/router/router.config.tsx`

- [ ] Run `pnpm.cmd exec eslint` on touched files
- [ ] Report verification result and remaining repo-wide build caveat
