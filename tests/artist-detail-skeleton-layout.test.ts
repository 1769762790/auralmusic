import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  ARTIST_DETAIL_HERO_LAYOUT,
  ARTIST_DETAIL_HERO_SKELETON_LAYOUT,
} from '../src/renderer/pages/Artists/Detail/artist-detail-layout.model.ts'

const heroSource = readFileSync(
  new URL(
    '../src/renderer/pages/Artists/Detail/components/ArtistHero.tsx',
    import.meta.url
  ),
  'utf8'
)

const skeletonSource = readFileSync(
  new URL(
    '../src/renderer/pages/Artists/Detail/components/ArtistDetailSkeleton.tsx',
    import.meta.url
  ),
  'utf8'
)

test('artist detail hero and skeleton share the same outer layout tokens', () => {
  assert.equal(
    ARTIST_DETAIL_HERO_LAYOUT.grid,
    'grid items-center gap-8 lg:grid-cols-[320px_minmax(0,1fr)]'
  )
  assert.equal(
    ARTIST_DETAIL_HERO_LAYOUT.content,
    'mt-2 flex min-w-0 flex-col justify-center gap-5 py-4'
  )
  assert.equal(ARTIST_DETAIL_HERO_LAYOUT.avatar, 'w-62.5')
  assert.equal(
    ARTIST_DETAIL_HERO_LAYOUT.moreButton,
    'w-[100px] rounded-full py-7'
  )

  assert.match(heroSource, /ARTIST_DETAIL_HERO_LAYOUT\.grid/)
  assert.match(heroSource, /ARTIST_DETAIL_HERO_LAYOUT\.content/)
  assert.match(heroSource, /ARTIST_DETAIL_HERO_LAYOUT\.avatar/)
  assert.match(heroSource, /ARTIST_DETAIL_HERO_LAYOUT\.moreButton/)
})

test('artist detail skeleton mirrors the loaded hero silhouette', () => {
  assert.equal(
    ARTIST_DETAIL_HERO_SKELETON_LAYOUT.avatar,
    'aspect-square w-62.5 rounded-full'
  )
  assert.equal(
    ARTIST_DETAIL_HERO_SKELETON_LAYOUT.title,
    'h-14 w-64 rounded-full'
  )
  assert.equal(
    ARTIST_DETAIL_HERO_SKELETON_LAYOUT.meta,
    'mt-5 h-6 w-72 rounded-full'
  )
  assert.equal(
    ARTIST_DETAIL_HERO_SKELETON_LAYOUT.summary,
    'h-[108px] w-full rounded-[24px]'
  )
  assert.equal(
    ARTIST_DETAIL_HERO_SKELETON_LAYOUT.moreButton,
    'h-14 w-[100px] rounded-full'
  )

  assert.match(skeletonSource, /ARTIST_DETAIL_HERO_LAYOUT\.grid/)
  assert.match(skeletonSource, /ARTIST_DETAIL_HERO_LAYOUT\.content/)
  assert.match(skeletonSource, /ARTIST_DETAIL_HERO_SKELETON_LAYOUT\.avatar/)
  assert.doesNotMatch(skeletonSource, /aspect-\[4\/4\.4\]/)
})
