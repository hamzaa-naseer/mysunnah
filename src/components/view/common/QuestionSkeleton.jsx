import { Skeleton } from 'antd'
import React from 'react'

const QuestionSkeleton = () => {
  return (
    <>
      <div className='question_skeleton' >
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    </>
  )
}

export default QuestionSkeleton