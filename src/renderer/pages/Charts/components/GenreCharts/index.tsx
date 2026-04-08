import { useNavigate } from 'react-router-dom'
import GenreChartsCardItem from './GenreChartsCardItem'
import type { OnlineChartSummary } from '../CoreRankings/CoreRankingCardItem.type'

interface GenreChartsProps {
  list: OnlineChartSummary[]
}

const GenreCharts = ({ list }: GenreChartsProps) => {
  const navigate = useNavigate()

  return (
    <div className='w-full'>
      <div className='mt-10 mb-4 text-2xl font-bold'>全球排行榜</div>
      <div className='3xl:grid-cols-8 grid w-full gap-5 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6'>
        {list.map(chart => (
          <GenreChartsCardItem
            key={chart.id}
            chart={chart}
            onOpen={chartId => navigate(`/playlist/${chartId}`)}
          />
        ))}
      </div>
    </div>
  )
}

export default GenreCharts
