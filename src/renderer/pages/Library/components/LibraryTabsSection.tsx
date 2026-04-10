import { useState } from 'react'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  LIBRARY_TAB_OPTIONS,
  type LibraryPageData,
  type LibraryTabValue,
  type PlaylistFilterValue,
} from '../library.model'
import LibraryAlbumPanel from './LibraryAlbumPanel'
import LibraryArtistPanel from './LibraryArtistPanel'
import LibraryCloudPanel from './LibraryCloudPanel'
import LibraryMvPanel from './LibraryMvPanel'
import LibraryPlaylistPanel from './LibraryPlaylistPanel'
import LibraryRankingPanel from './LibraryRankingPanel'

interface LibraryTabsSectionProps {
  data: LibraryPageData
  playlistLoading?: boolean
  rankingLoading?: boolean
  onOpenPlaylist: (id: number) => void
  onOpenMv: (id: number) => void
  playlistFilter: PlaylistFilterValue
  onPlaylistFilterChange: (value: PlaylistFilterValue) => void
}

const LibraryTabsSection = ({
  data,
  playlistLoading = false,
  rankingLoading = false,
  onOpenPlaylist,
  onOpenMv,
  playlistFilter: _playlistFilter,
  onPlaylistFilterChange: _onPlaylistFilterChange,
}: LibraryTabsSectionProps) => {
  const [activeTab, setActiveTab] = useState<LibraryTabValue>('playlists')

  return (
    <section className='w-full space-y-6'>
      <div className='grid w-full items-center'>
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as LibraryTabValue)}
          className='w-full'
        >
          <div className='flex w-full items-center justify-between gap-4'>
            <TabsList variant='line' className='bg-transparent p-0'>
              {LIBRARY_TAB_OPTIONS.map(option => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className='rounded-[14px] px-4 py-2.5 text-base font-semibold data-active:bg-neutral-100 data-active:text-neutral-950'
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <Button
              type='button'
              variant='outline'
              className='h-12 rounded-[16px] border-neutral-200 bg-white px-5 text-base font-semibold text-neutral-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
            >
              <Plus className='mr-2 size-4' />
              新建歌单
            </Button>
          </div>

          <TabsContent value='playlists' className='w-full pt-6'>
            <LibraryPlaylistPanel
              playlists={data.playlists}
              loading={playlistLoading}
              onOpen={onOpenPlaylist}
            />
          </TabsContent>

          <TabsContent value='albums' className='w-full pt-6'>
            <LibraryAlbumPanel active={activeTab === 'albums'} />
          </TabsContent>

          <TabsContent value='artists' className='w-full pt-6'>
            <LibraryArtistPanel active={activeTab === 'artists'} />
          </TabsContent>

          <TabsContent value='mvs' className='w-full pt-6'>
            <LibraryMvPanel active={activeTab === 'mvs'} onOpen={onOpenMv} />
          </TabsContent>

          <TabsContent value='cloud' className='w-full pt-6'>
            <LibraryCloudPanel active={activeTab === 'cloud'} />
          </TabsContent>

          <TabsContent value='rankings' className='w-full pt-6'>
            <LibraryRankingPanel
              rankings={data.rankings}
              loading={rankingLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

export default LibraryTabsSection
