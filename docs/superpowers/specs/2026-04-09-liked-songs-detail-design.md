# Liked Songs Detail Page Design

**Goal:** Add a dedicated liked songs detail page reachable from the Library "我喜欢的音乐" card, with automatic data loading based on the authenticated user's liked song ids.

**Context**

The Library page currently uses `getLikeList(uid)` only to compute a preview count and fetch a small preview set for the hero card. Clicking the hero currently routes to the existing daily recommendations page, which is the wrong destination and the wrong data source for a liked songs experience.

The liked songs API available in the current codebase is `getLikeList(uid)`, which returns song ids rather than full rows. To render a real detail list, the page must follow the same enrichment pattern already used in the Library hero: fetch liked ids first, then fetch song details with `getSongDetail(ids)`.

**Recommended Approach**

Create a dedicated `LikedSongs` page under `src/renderer/pages/LikedSongs`, keep it independent from `DailySongs`, and reuse the existing daily-song list row presentation where it fits. This keeps page responsibilities clear and avoids overloading `DailySongs` with a second business mode that would later diverge in title, hero content, and routing semantics.

**Design**

1. Add a new authenticated route at `/library/liked-songs`.
2. Create a page container at `src/renderer/pages/LikedSongs/index.tsx`.
3. Reuse `getLikeList(uid)` to fetch the full liked-song id set for the current user.
4. Reuse `getSongDetail(ids)` to enrich those ids into song rows.
5. Normalize the enriched response into the same row shape used by `DailySongRow`.
6. Reuse the existing song-list presentation components where possible instead of rebuilding the table.
7. Change the Library hero card so the full card is clickable and routes to the new page.
8. Keep the play button behavior aligned with the card click to avoid split navigation behavior.

**Page Structure**

- `LikedSongs/index.tsx`: page container, auth-state handling, data fetching, loading/error/empty state selection
- `LikedSongs/liked-songs.model.ts`: page state and response normalization helpers
- `LikedSongs/components/LikedSongsHero.tsx`: lightweight header with title and total count

Existing reusable pieces:

- `src/renderer/pages/DailySongs/components/DailySongsList.tsx`
- `src/renderer/pages/DailySongs/components/DailySongRow.tsx`
- `src/renderer/pages/DailySongs/components/DailySongsSkeleton.tsx` if the structure remains compatible

**Data Flow**

- `Library` still fetches preview liked-song data for the hero card.
- `LibraryHero` receives a single `onOpenLikedSongs` callback and applies it to the full card surface.
- The router resolves `/library/liked-songs` to the new `LikedSongs` page.
- `LikedSongs/index.tsx` reads the authenticated user id from `useAuthStore`.
- The page calls `getLikeList(uid)` and extracts liked song ids.
- If ids exist, the page calls `getSongDetail(ids)` once and normalizes the response into row items.
- The page renders hero + list, or an empty/error state when applicable.

**Error Handling**

- If the user is unauthenticated, the page should show the same locked-state treatment used by Library.
- If `getLikeList` fails or `getSongDetail` fails, log the error and show a page-level failure message.
- If the liked song list is empty, render a page-level empty state instead of an empty table.

**Interaction Rules**

- Clicking anywhere on the Library "我喜欢的音乐" hero card should navigate to `/library/liked-songs`.
- The play button inside the card should keep the same destination as the card so the whole entry has a single navigation rule.
- The new detail page should auto-load on mount; no manual trigger is required.

**Testing**

- Add a focused model test for the liked songs normalization pipeline.
- Verify `getLikeList` id extraction and `getSongDetail` normalization compose into the expected row list.
- Verify empty liked-song ids return an empty list without requiring a detail fetch result.
- Run targeted Node tests for the new model and the touched Library path.
- Run changed-file lint checks after implementation.
