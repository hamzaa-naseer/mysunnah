import { Skeleton } from 'antd'
import React from 'react'

const ShowScoreSkeleton = () => {
  return (
    <div className='show_score_skeleton' >
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  )
}

export default ShowScoreSkeleton