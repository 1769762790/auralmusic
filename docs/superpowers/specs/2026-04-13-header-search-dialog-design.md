# Header Search Dialog Design

**Goal:** Add a header-triggered music search dialog that supports `单曲 / 专辑 / 歌单 / MV` type switching, debounced keyword search, infinite scroll results, and type-specific item actions.

**Context**

The current header only renders a `SearchIcon` and has no dialog, no search state, and no usable search API wrapper. The repository already has the primitives needed for this feature: a reusable `Dialog`, the new `InputGroup` and `Select` UI atoms, and `useIntersectionLoadMore` for sentinel-based pagination.

The current `src/renderer/api/search.ts` is placeholder code and must be replaced with a thin `/cloudsearch` service. The renderer should not consume raw search payloads directly because result shapes differ across songs, albums, playlists, and MVs.

**Recommended Approach**

Build the feature as a local header enhancement rather than a global search subsystem. Keep dialog state and search state inside a dedicated reusable `SearchDialog` business component mounted by `Header`, and keep request construction in `src/renderer/api/search.ts`. Normalize API responses into one stable row model before rendering so the list UI stays simple and type-safe.

This is the lowest-coupling option for the current requirement. It avoids introducing a global store or a route-level search page before the product actually needs those abstractions.

**Design**

1. Keep `Header` responsible only for rendering the search trigger and opening the dialog.
2. Add a reusable `SearchDialog` business component under `src/renderer/components`.
3. Build the search bar with `InputGroup`, `InputGroupInput`, `InputGroupAddon`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, and `SelectItem`.
4. Support four search types only: `song`, `album`, `playlist`, `mv`.
5. Map those types to `/cloudsearch` codes: `1`, `10`, `1000`, `1004`.
6. Trigger search after first input with debounce; when the type changes and the keyword is still valid, re-run the search immediately for the new type.
7. Reuse `useIntersectionLoadMore` for paginated result fetching and reset pagination whenever keyword or type changes.
8. Normalize each result row to a single display model containing `id`, `type`, `name`, `artistName`, `coverUrl`, `targetId`, and `disabled`.
9. Render each row in three columns only: cover, name, artist.
10. Support item actions by type: song plays immediately, album navigates to album detail, playlist navigates to playlist detail, MV renders but remains non-interactive.

**Component Structure**

- `src/renderer/components/Header/index.tsx`
  Add the search trigger button and mount the dialog component.
- `src/renderer/components/SearchDialog/index.tsx`
  Owns open state, keyword state, selected type, debounced query handling, pagination resets, and item action dispatch.
- `src/renderer/components/SearchDialog/components/SearchInputBar.tsx`
  Pure presentational search field plus right-side type selector.
- `src/renderer/components/SearchDialog/components/SearchResultList.tsx`
  Renders empty, loading, error, results, and footer load-more states.
- `src/renderer/components/SearchDialog/components/SearchResultRow.tsx`
  Renders a single normalized row and handles disabled styling for MV items.
- `src/renderer/components/SearchDialog/search-dialog.model.ts`
  Search type metadata, type-code mapping, payload normalization, and small view-model helpers.

**API Layer**

- Replace the placeholder `src/renderer/api/search.ts` implementation with a thin `searchResources` function.
- Request path: `/cloudsearch`
- Required parameter: `keywords`
- Optional parameters used here: `type`, `limit`, `offset`
- Default page size: `20` or `30`; the implementation should choose one fixed value and keep it consistent between reset and load-more requests.
- API layer only builds the request and returns the response payload; response normalization happens in the local search model file.

**Data Flow**

- User clicks the header search trigger.
- `SearchDialog` opens and autofocuses the input.
- Before a keyword exists, the dialog shows an idle hint instead of firing requests.
- When the keyword becomes non-empty, the dialog starts a debounced search.
- The active keyword and selected search type define the current query key.
- Query-key changes trigger `reset()` on `useIntersectionLoadMore`.
- The load-more hook requests the next `/cloudsearch` page through `searchResources`.
- Raw response items are normalized into one row model before rendering.
- The result list consumes only normalized rows and never depends on type-specific response fields.

**Interaction Rules**

- Triggering:
  - First non-empty input starts search after a short debounce.
  - Subsequent keyword changes continue to use debounce.
  - Type changes with a non-empty keyword immediately start a fresh search for the selected type.
- Dialog:
  - The input is focused when the dialog opens.
  - Closing the dialog does not need to persist search history in this iteration.
- List row actions:
  - `song`: trigger existing playback flow directly from the selected row.
  - `album`: close the dialog and navigate to the album detail route.
  - `playlist`: close the dialog and navigate to the playlist detail route.
  - `mv`: render the row in a disabled state and do not dispatch navigation or playback.
- Presentation:
  - Every row shows cover, name, and artist.
  - If a type has no reliable artist field, normalization should degrade gracefully to an empty string or a fallback label without branching in the UI.

**State Boundaries**

- `Header` should not own search business state beyond opening the dialog.
- `SearchDialog` owns:
  - open/close state
  - keyword
  - selected search type
  - first-search / idle-state gating
  - fetch error text if needed
- `useIntersectionLoadMore` owns:
  - list accumulation
  - loading
  - `hasMore`
  - sentinel registration
- No new global zustand store is needed for this iteration.

**Error Handling**

- Empty keyword: no request, idle guidance only.
- Initial request loading: show a list-level loading state or skeleton rows.
- No results: show a keyword-aware empty state for the current type.
- Load-more in progress: show a footer loading hint.
- Request failure: show a list-level error state but keep the input and type selector interactive for retry by typing or switching type.
- Stale requests must not overwrite newer results; rely on the existing `requestVersion` behavior in `useIntersectionLoadMore`.

**Testing**

- Add focused model tests for:
  - type-to-code mapping
  - normalization of songs, albums, playlists, and MVs into the shared row model
  - disabled MV row behavior in the model layer
- Add focused tests for query reset behavior if extracted into a pure helper; otherwise keep that logic simple inside the dialog container.
- Run targeted tests for the new search model.
- Run `pnpm lint` after implementation.
- Use `pnpm dev` for functional verification of dialog open, debounce, type switch, infinite scroll, and row click behavior.

**Out of Scope**

- Recent searches
- Search history persistence
- Keyboard up/down command-palette navigation
- Independent search results page
- MV playback or MV detail page work
- Extending this feature to singers, users, lyrics, radio, or comprehensive search
