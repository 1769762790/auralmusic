import test from 'node:test'
import assert from 'node:assert/strict'

import {
  findCreatedCollectPlaylistTarget,
  insertCollectPlaylistTarget,
  isSongInPlaylistTrackIds,
  normalizeCollectPlaylistTargets,
} from '../src/renderer/model/collect-to-playlist.model.ts'

test('normalizeCollectPlaylistTargets keeps liked playlist and editable created playlists only', () => {
  const playlists = normalizeCollectPlaylistTargets({
    data: {
      playlist: [
        {
          id: 100,
          name: '我喜欢的音乐',
          coverImgUrl: 'liked.jpg',
          trackCount: 58,
          specialType: 5,
          subscribed: false,
        },
        {
          id: 101,
          name: '夜骑',
          coverImgUrl: 'my.jpg',
          trackCount: 12,
          subscribed: false,
        },
        {
          id: 102,
          name: '收藏的别人的歌单',
          coverImgUrl: 'subscribed.jpg',
          trackCount: 99,
          subscribed: true,
        },
      ],
    },
  })

  assert.deepEqual(playlists, [
    {
      id: 100,
      name: '我喜欢的音乐',
      coverImgUrl: 'liked.jpg',
      trackCount: 58,
      specialType: 5,
      editable: true,
      isLikedPlaylist: true,
    },
    {
      id: 101,
      name: '夜骑',
      coverImgUrl: 'my.jpg',
      trackCount: 12,
      specialType: 0,
      editable: true,
      isLikedPlaylist: false,
    },
  ])
})

test('insertCollectPlaylistTarget prepends new playlist and removes stale duplicate entry', () => {
  const current = [
    {
      id: 100,
      name: '我喜欢的音乐',
      coverImgUrl: 'liked.jpg',
      trackCount: 58,
      specialType: 5,
      editable: true,
      isLikedPlaylist: true,
    },
    {
      id: 101,
      name: '夜骑',
      coverImgUrl: 'my.jpg',
      trackCount: 12,
      specialType: 0,
      editable: true,
      isLikedPlaylist: false,
    },
  ]

  const inserted = insertCollectPlaylistTarget(current, {
    id: 101,
    name: '夜骑',
    coverImgUrl: 'my-new.jpg',
    trackCount: 13,
    specialType: 0,
    editable: true,
    isLikedPlaylist: false,
  })

  assert.deepEqual(inserted, [
    {
      id: 101,
      name: '夜骑',
      coverImgUrl: 'my-new.jpg',
      trackCount: 13,
      specialType: 0,
      editable: true,
      isLikedPlaylist: false,
    },
    {
      id: 100,
      name: '我喜欢的音乐',
      coverImgUrl: 'liked.jpg',
      trackCount: 58,
      specialType: 5,
      editable: true,
      isLikedPlaylist: true,
    },
  ])
})

test('isSongInPlaylistTrackIds returns true only when target song id exists', () => {
  assert.equal(isSongInPlaylistTrackIds(12345, [1, 2, 12345]), true)
  assert.equal(isSongInPlaylistTrackIds(12345, [1, 2, 3]), false)
  assert.equal(isSongInPlaylistTrackIds(12345, []), false)
})

test('findCreatedCollectPlaylistTarget prefers newly inserted playlist id after refresh', () => {
  const previous = normalizeCollectPlaylistTargets({
    playlist: [
      {
        id: 100,
        name: '我喜欢的音乐',
        coverImgUrl: 'liked.jpg',
        trackCount: 58,
        specialType: 5,
        subscribed: false,
      },
      {
        id: 101,
        name: '夜骑',
        coverImgUrl: 'my.jpg',
        trackCount: 12,
        subscribed: false,
      },
    ],
  })

  const next = normalizeCollectPlaylistTargets({
    playlist: [
      {
        id: 100,
        name: '我喜欢的音乐',
        coverImgUrl: 'liked.jpg',
        trackCount: 58,
        specialType: 5,
        subscribed: false,
      },
      {
        id: 101,
        name: '夜骑',
        coverImgUrl: 'my.jpg',
        trackCount: 12,
        subscribed: false,
      },
      {
        id: 202,
        name: '通勤',
        coverImgUrl: 'new.jpg',
        trackCount: 0,
        subscribed: false,
      },
    ],
  })

  assert.deepEqual(findCreatedCollectPlaylistTarget(previous, next, '通勤'), {
    id: 202,
    name: '通勤',
    coverImgUrl: 'new.jpg',
    trackCount: 0,
    specialType: 0,
    editable: true,
    isLikedPlaylist: false,
  })
})
