# Image Cache Phase 1 Design

## Summary

This phase adds disk-backed image caching by extending the existing cache pipeline with an `image` cache type and validating it through a single page trial on the artist detail route (`/artists/:id`).

The goal of phase 1 is narrow:

- Reuse the existing cache service, IPC bridge, cache directory selection, and LRU eviction behavior
- Add image-specific cache resolution in the main process
- Expose image cache resolution through preload
- Trial the capability only on the artist detail page

This phase does not attempt to redesign global image loading, convert all image entry points to a shared image component, or solve first-visit rendering jank by itself.

## Problem

Image-heavy pages such as artist detail repeatedly fetch the same remote images across visits. That creates avoidable network transfer, repeated decoding, and unnecessary pressure on the renderer when revisiting the same page.

The repository already has a cache system for:

- audio files
- lyrics payloads

There is no equivalent cache path for images yet.

## Scope

### In scope

- Extend cache entry types to support `image`
- Add image file persistence under the existing disk cache root
- Reuse the existing shared cache index and LRU eviction policy
- Add `resolveImageSource(cacheKey, sourceUrl)` to cache IPC and preload
- Add artist-detail-only image cache trial for the heaviest image surfaces
- Add focused tests for image cache behavior

### Out of scope

- Global replacement of all `<img>` and background-image call sites
- Background-image to `<img>` migration across the codebase
- Placeholder, shimmer, progressive image loading, or unified cached image component
- First-visit renderer jank elimination
- Separate image cache settings, metrics, or UI in Settings

## Design Choice

### Chosen approach

Extend the existing `CacheService` with an `image` cache type instead of creating a dedicated image cache subsystem.

### Why this approach

- Lowest implementation risk for phase 1
- Reuses existing disk cache settings and cleanup logic
- Keeps cache eviction across audio, lyrics, and images under one policy
- Makes a later global image-loading abstraction easier without locking us into a second cache stack

### Rejected alternatives

#### Separate `ImageCacheService`

Rejected for phase 1 because it duplicates:

- index persistence
- root directory management
- eviction logic
- IPC surface

This would create more code and more maintenance overhead before the capability is validated.

#### Renderer-only cache or Service Worker

Rejected because the current Electron architecture already has a disk cache pipeline in the main process. Keeping binary fetch/write in the main process is more consistent with existing audio cache behavior.

## Architecture

### Cache model changes

The shared cache model currently supports `audio` and `lyrics`. It will add `image`.

Expected effect:

- cache entries keep using the same `index.json`
- relative paths are still keyed by cache entry id
- LRU eviction remains shared across all cacheable resource types

Directory layout after this change:

- `audio/`
- `lyrics/`
- `images/`
- `index.json`

### Main-process resolution

Add `resolveImageSource(params)` to `CacheService`.

Behavior:

- If disk cache is disabled, return the original remote URL and do not write anything.
- If an image cache entry exists and the file is present, return a local file URL and mark the entry as recently used.
- If there is no cache hit:
  - return the original remote URL immediately
  - start a background fetch-and-persist task for the image

This is intentionally different from audio:

- audio cache today fetches synchronously during resolution
- image cache phase 1 should not block page rendering while writing cache

That behavior keeps phase 1 low-risk and avoids adding more latency to the first visit.

### Preload and renderer access

Add an image resolution method beside the existing audio/lyrics methods in the cache bridge.

Planned API:

```ts
resolveImageSource(cacheKey: string, sourceUrl: string): Promise<{
  url: string
  fromCache: boolean
}>
```

The renderer contract stays simple:

- pass a stable key and source URL
- receive either a local file URL or the original remote URL

### Artist detail trial

Only `/artists/:id` will use the new image cache path in phase 1.

Trial targets:

- hero/profile cover
- similar artists
- albums list covers
- MV list covers

Renderer usage should remain page-local in this phase. Do not introduce a new global image abstraction yet.

Recommended page-local structure:

- small helper for building artist-page image cache keys
- page-local async resolution flow that maps remote URLs to resolved URLs before passing them into child sections

This keeps the experiment isolated and easy to remove or expand.

## Data Flow

### Cache miss on first visit

1. Artist detail page receives remote image URLs from API responses.
2. Renderer asks `window.electronCache.resolveImageSource(cacheKey, sourceUrl)`.
3. Main process checks the cache index.
4. No entry exists, so it returns the original remote URL immediately.
5. Main process starts background persistence for the image.
6. Current page continues using the remote URL.
7. Future visits can resolve to the local file URL.

### Cache hit on later visit

1. Renderer asks for the same cache key and source URL.
2. Main process finds a valid `image` cache entry.
3. Main process returns a local file URL immediately.
4. Renderer uses the local image path instead of the remote image URL.

## Cache Key Strategy

Phase 1 should use explicit semantic keys, not raw URL-only keys.

Recommended pattern:

- `artist:detail:hero:<artistId>`
- `artist:detail:similar:<artistId>:<relatedArtistId>`
- `artist:detail:album:<albumId>`
- `artist:detail:mv:<mvId>`

Reasoning:

- Stable keys are easier to reason about in tests
- They survive remote URL changes better if the logical asset remains the same
- They keep future invalidation policy flexible

## File-Level Change Plan

### Main process

- `src/main/cache/cache-types.ts`
  - add `image` cache entry type
  - add image resolve param/result types if kept separate

- `src/main/cache/cache-service.ts`
  - add `images/` cache directory
  - add content-type extension mapping for image formats
  - add image fetch/write path
  - add background persistence path for image misses
  - ensure eviction and status logic include image entries safely

- `src/main/ipc/cache-ipc.ts`
  - register `resolveImageSource`

- `src/shared/ipc/cache.ts`
  - add image cache IPC channel

### Preload

- `src/preload/api/cache-api.ts`
  - expose `resolveImageSource`

### Renderer

- `src/renderer/pages/Artists/Detail/index.tsx`
  - add page-local image resolution orchestration
  - resolve trial image URLs through the new cache API

- `src/renderer/pages/Artists/Detail/components/*`
  - accept resolved URLs with no behavioral redesign

### Tests

- `tests/cache-service.test.ts`
  - image hit/miss/background persistence coverage
  - image extension/content-type handling
  - eviction compatibility with image entries

- `tests/cache-ipc.test.ts`
  - image IPC registration coverage

- new or existing artist-detail-related tests
  - verify page-local cache key generation and resolution behavior at the trial boundary

## Error Handling

Image cache must degrade safely.

Rules:

- If remote fetch fails, keep using the original remote URL
- If a cache entry exists but the file is missing, delete the stale index entry and fall back safely
- If disk cache is disabled, perform no write and return the original URL
- If content type is unknown, store with a conservative binary-compatible extension rather than crashing the pipeline

The user should never see a broken page solely because image caching failed.

## Testing Strategy

Phase 1 tests should prove:

- cached image hits return file URLs
- first-time misses return the original URL without blocking
- background writes eventually create reusable image entries
- stale files are pruned correctly
- artist detail trial code requests image cache resolution with stable semantic keys

Manual validation should cover:

1. Enable disk cache
2. Open an artist detail page with many images
3. Close and re-open the same artist page
4. Confirm repeated image requests drop and local file usage appears
5. Confirm the page still renders if cache write fails

## Risks

### Shared eviction pressure

Because images will share the existing cache budget with audio and lyrics, a heavy image session could consume more of the cache budget than before.

This is acceptable in phase 1 because:

- the project already uses one shared disk cache setting
- it avoids new settings/UI complexity

If this becomes a problem, phase 2 can split accounting or add per-type quotas.

### First-visit impact remains

This phase does not remove first-visit decode/render work. It improves repeat visits and repeated fetch behavior. Further image-loading optimization remains a later phase.

### Background fetch duplication

If the same page asks for the same uncached image multiple times before the first background write completes, duplicate writes are possible unless in-flight deduplication is added.

Phase 1 should add lightweight in-flight request deduplication inside the cache service if the implementation is straightforward. If not, it should be explicitly deferred and documented.

## Success Criteria

Phase 1 is successful if:

- image cache support exists in the main process and preload bridge
- artist detail page is the only trial page using it
- cache failures never break rendering
- `pnpm lint` still passes
- targeted tests pass
- repeat visits to artist detail reuse locally cached image URLs
