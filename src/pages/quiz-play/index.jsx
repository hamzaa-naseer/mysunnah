import dynamic from "next/dynamic"
import { Suspense } from "react"
import QuestionSkeleton from "src/components/view/common/QuestionSkeleton"

const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const AllQuiz = dynamic(() => import('src/components/AllQuiz/AllQuiz'), { ssr: false })

const Index = () => {
  return (
    <Layout>
      <Suspense fallback={<QuestionSkeleton />}>
        <AllQuiz />
      </Suspense>
    </Layout>
  )
}

export default Index