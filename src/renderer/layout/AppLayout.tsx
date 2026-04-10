import Header from '@/components/Header'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import KeepAliveRouteOutlet from 'keepalive-for-react-router'
import { Toaster } from '@/components/ui/sonner'

const AppLayout = () => {
  const isWindows = window.appRuntime.getPlatform() === 'win32'

  return (
    <main
      className={`w-full px-12 pb-10 xl:px-25 2xl:px-50 ${
        isWindows ? 'pt-20' : 'pt-16.25'
      }`}
    >
      <Header className='window-drag fixed top-0 right-0 left-0 z-50 pt-2.5 pb-1.25' />
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
