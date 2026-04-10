import TrackListItem, { songProps } from './TrackListItem'

interface TrackListProps {
  data: songProps[]
}

const TrackList = ({ data = [] }: TrackListProps) => {
  console.log(data)

  return (
    <div>
      {data?.length > 0 ? (
        <div>
          {data?.map(item => {
            return <TrackListItem key={item.id} item={item} />
          })}
        </div>
      ) : (
        <div>暂无数据</div>
      )}
    </div>
  )
}

export default TrackList
