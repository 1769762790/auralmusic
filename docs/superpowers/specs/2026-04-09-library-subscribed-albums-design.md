# Library Subscribed Albums Design

**Goal:** Replace the Library albums tab data source with the authenticated subscribed albums API and load it lazily only when the albums tab becomes active.

**Context**

The current Library page fetches `getNewAlbums()` during base page hydration. That produces a discovery feed, not the authenticated user's saved albums, so the albums tab shows the wrong data set.

The Library artists tab already uses a better pattern for authenticated saved content: activate the tab, fetch only then, and paginate with `useIntersectionLoadMore`. The albums tab should behave the same way.

**Design**

1. Add a dedicated subscribed albums API function in `src/renderer/api/album.ts` for `/album/sublist`.
2. Remove Library albums from the eager `loadBaseData()` batch in `src/renderer/pages/Library/index.tsx`.
3. Move albums-tab fetching into `LibraryAlbumPanel`.
4. Trigger the first fetch only when the `albums` tab becomes active.
5. Reuse `useIntersectionLoadMore` for offset-based pagination and append results on scroll.
6. Keep the existing album card grid, empty state, and navigation behavior.

**Data Flow**

- `LibraryTabsSection` owns the active tab state.
- When the active tab is `albums`, it passes `active={true}` to `LibraryAlbumPanel`.
- `LibraryAlbumPanel` calls `getSubscribedAlbums({ limit, offset })`.
- A local normalization helper converts the response into `{ list, hasMore }`.
- `useIntersectionLoadMore` manages pagination, loading, and the sentinel.

**Error Handling**

- Tab-local failures log to the console and stop further pagination for the current session.
- The panel keeps its own empty state when no saved albums are returned.
- No new page-wide error state is added because the failure scope is only the albums tab.

**Testing**

- Add a focused regression test for the albums pagination normalizer.
- Verify nested `data`, `hasMore`/`more`, and `count` fallback handling.
- Run the targeted Node test and changed-file lint checks.
