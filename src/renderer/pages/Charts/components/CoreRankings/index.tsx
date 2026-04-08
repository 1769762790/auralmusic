import { useNavigate } from 'react-router-dom'
import CoreRankingCardItem from './CoreRankingCardItem'
import type { OnlineChartSummary } from './CoreRankingCardItem.type'

interface CoreRankingsProps {
  topList?: OnlineChartSummary[]
}

const CoreRankings = ({ topList = [] }: CoreRankingsProps) => {
  const navigate = useNavigate()

  return (
    <div className='w-full'>
      <div className='mb-4 text-2xl font-bold'>官方榜单</div>
      <div className='grid grid-cols-4 gap-5'>
        {topList.map((chart, index) => (
          <CoreRankingCardItem
            key={chart.id}
            chart={chart}
            index={index}
            onOpen={chartId => navigate(`/playlist/${chartId}`)}
          />
        ))}
      </div>
    </div>
  )
}

export default CoreRankings
