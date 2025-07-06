import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const RandomBattle = dynamic(() => import('src/components/Quiz/RandomBattle/RandomBattle'), { ssr: false })
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })

const Index = () => {
  return (
    <Layout> <Suspense fallback={<QuestionSkeleton />}><RandomBattle /></Suspense></Layout>
  )
}

export default Index