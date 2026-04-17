import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@applemusic-like-lyrics/core/style.css'
import '@/styles/globals.css'
import '@/styles/index.css'
import router from '@/router'
import { Suspense } from 'react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<div>Loading...</div>}>
    <RouterProvider router={router} />
  </Suspense>
)
