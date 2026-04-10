# Library Subscribed MVs Design

**Goal:** Replace the Library MV tab data source with the authenticated subscribed MV API and load it lazily only when the MV tab becomes active.

**Context**

The current Library page fetches `getTopMvs()` during base page hydration. That surfaces a discovery feed instead of the authenticated user's saved MVs, so the MV tab shows the wrong dataset.

The Library artists and albums tabs already follow the correct pattern for saved content: the tab activates first, then the panel fetches lazily and paginates with `useIntersectionLoadMore`. The MV tab should match that behavior.

**Design**

1. Add a dedicated subscribed MV API function in `src/renderer/api/mv.ts` for `/mv/sublist`.
2. Remove Library MVs from the eager `loadBaseData()` batch in `src/renderer/pages/Library/index.tsx`.
3. Move MV-tab fetching into `LibraryMvPanel`.
4. Trigger the first fetch only when the `mvs` tab becomes active.
5. Reuse `useIntersectionLoadMore` for offset-based pagination and append results on scroll.
6. Keep the existing MV card layout, empty state, and open-detail behavior.

**Data Flow**

- `LibraryTabsSection` owns the active tab state.
- When the active tab is `mvs`, it passes `active={true}` to `LibraryMvPanel`.
- `LibraryMvPanel` calls `getSubscribedMvs({ limit, offset })`.
- A local normalization helper converts the response into `{ list, hasMore }`.
- `useIntersectionLoadMore` manages pagination, loading, and the sentinel.

**Error Handling**

- Tab-local failures log to the console and stop further pagination for the current session.
- The panel keeps its own empty state when no saved MVs are returned.
- No page-wide error state is introduced because the failure scope is limited to one tab.

**Testing**

- Add a focused regression test for the MV pagination normalizer.
- Verify nested `data`, `hasMore`/`more`, and `count` fallback handling.
- Run targeted Node tests and changed-file lint checks.
