import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const GroupBattle = dynamic(() => import('src/components/Quiz/GroupBattle/GroupBattle'), { ssr: false })
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })

const Index = () => {
  return (
    <Layout>
      <Suspense fallback={<QuestionSkeleton />}>
        <GroupBattle />
      </Suspense>
    </Layout>
  )
}

export default Index