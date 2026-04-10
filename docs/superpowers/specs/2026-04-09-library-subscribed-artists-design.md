# Library Subscribed Artists Design

**Goal:** Replace the Library artists tab data source with the authenticated subscribed artists API and load it lazily only when the artists tab becomes active.

**Context**

The current Library page fetches `getTopArtists()` during base page hydration and stores the result in `LibraryPageData`. That behavior is incorrect for the Library artists tab because the tab is meant to reflect the authenticated user's saved artists, not the global top artists list.

The project already has an infinite-scroll pattern in `src/renderer/hooks/useLoadMore.ts` and the standalone Artists page. Reusing that pattern keeps the change local and consistent with the repo's renderer conventions.

**Design**

1. Add a dedicated subscribed artists API function in `src/renderer/api/artist.ts` for `/artist/sublist`.
2. Remove Library artists from the eager `loadBaseData()` batch in `src/renderer/pages/Library/index.tsx`.
3. Move artists-tab fetching into `LibraryArtistPanel`, which becomes a focused container/presentation hybrid for this tab only.
4. Trigger the first fetch only when the `artists` tab becomes active.
5. Reuse `useIntersectionLoadMore` for offset-based pagination and append results on scroll.
6. Keep the existing card grid UI and empty state, and add a sentinel footer with loading / no-more messaging.

**Data Flow**

- `LibraryTabsSection` owns the active tab state.
- When the active tab is `artists`, it passes `active={true}` to `LibraryArtistPanel`.
- `LibraryArtistPanel` calls `getSubscribedArtists({ limit, offset })`.
- A page-local normalization helper converts the response into `{ list, hasMore }`.
- `useIntersectionLoadMore` manages pagination, loading, and the sentinel lifecycle.

**Error Handling**

- Fetch failures inside the artists panel log to the console and stop pagination for the current session.
- The panel keeps the existing empty-state treatment when no saved artists are returned.
- No page-wide error banner is introduced because the failure scope is limited to one tab.

**Testing**

- Add a focused regression test for the artists-tab pagination normalizer.
- Verify the new helper handles nested `data`, `hasMore`/`more`, and `count` fallback behavior.
- Run a targeted Node test and a focused TypeScript compile for the changed renderer files.
