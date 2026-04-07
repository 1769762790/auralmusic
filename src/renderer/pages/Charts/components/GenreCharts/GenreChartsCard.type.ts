import { OnlineChartSummary } from '..//CoreRankings/CoreRankingCardItem.type'

export interface GenreChartsCardProps {
  chart: OnlineChartSummary
  onOpen: (chartId: string) => void
}
