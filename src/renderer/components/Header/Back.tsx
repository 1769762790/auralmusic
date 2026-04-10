import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Back = () => {
  const navigate = useNavigate()

  return (
    <div className='window-no-drag flex items-center gap-3'>
      <button
        type='button'
        aria-label='后退'
        className='window-no-drag hover:bg-primary/5 inline-flex cursor-pointer items-center justify-center rounded-lg px-3 py-2 transition-colors'
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className='h-5 w-5' />
      </button>
      <button
        type='button'
        aria-label='前进'
        className='window-no-drag hover:bg-primary/5 inline-flex cursor-pointer items-center justify-center rounded-lg px-3 py-2 transition-colors'
        onClick={() => navigate(1)}
      >
        <ArrowRight className='h-5 w-5' />
      </button>
    </div>
  )
}

export default Back
