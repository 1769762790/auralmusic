import Header from '@/components/Header'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import KeepAliveRouteOutlet from 'keepalive-for-react-router'
import { Toaster } from '@/components/ui/sonner'

const AppLayout = () => {
  return (
    <main className='w-full px-12 pt-20 pb-10 xl:px-40 2xl:px-50'>
      <Header className='fixed top-0 right-0 left-0 z-50' />
      <div className='flex w-full items-center justify-center py-2'>
        <KeepAliveRouteOutlet
          include={['/', '/albums', '/artists', '/playlist']}
        />
        <ScrollToTopButton />
      </div>
      <Toaster />
    </main>
  )
}

export default AppLayout
