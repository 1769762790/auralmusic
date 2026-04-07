# Albums Page Design

**Goal**

Add a dedicated `Albums` page that shows the `/album/new` feed with category filters for `ALL`, `ZH`, `EA`, `KR`, and `JP`.

**Scope**

- Add a renderer page at `src/renderer/pages/Albums`
- Add a thin API wrapper in `src/renderer/api/album.ts`
- Register route `/albums`
- Update sidebar navigation to point `Albums` to `/albums`
- Reuse the shared infinite-load hook for first-page load and paging

**UI**

- Top filter bar with rounded chips matching the provided reference
- Responsive album grid with cover, title, and artist
- Album card keeps the current visual language used by Artists and Home cards
- Show page-local skeletons during the first load

**Data Flow**

- Page container owns selected `area`
- `getNewAlbums` calls `/album/new` with `area`, `limit`, and `offset`
- `useIntersectionLoadMore` handles first page, filter reset, and append loading
- Switching area resets the list and immediately requests page 1

**Boundaries**

- `index.tsx`: page state and data fetching
- `components/AlbumCard.tsx`: album presentation only
- `components/AlbumsSkeletons.tsx`: loading UI only
- `albums.model.ts`: page-local types and filter options

**Validation**

- Run ESLint on touched files
- Report that full build is still blocked by existing repository TypeScript issues
