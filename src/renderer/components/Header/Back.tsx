import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// 返回按钮组件，包含前进和后退功能
const Back = () => {
  const navigate = useNavigate()
  return (
    <div className='flex items-center gap-3'>
      <div className='hover:bg-primary/5 rounded-lg px-3 py-2'>
        <ArrowLeft
          className='h-5 w-5 cursor-pointer'
          onClick={() => navigate(-1)}
        />
      </div>
      <div className='hover:bg-primary/5 rounded-lg px-3 py-2'>
        <ArrowRight
          className='h-5 w-5 cursor-pointer'
          onClick={() => navigate(1)}
        />
      </div>
    </div>
  )
}

export default Back
