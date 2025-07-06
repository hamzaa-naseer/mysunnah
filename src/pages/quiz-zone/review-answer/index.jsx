"use client"
import { t } from 'i18next'
import { useRouter } from 'next/router'
import React, { Suspense } from 'react'
import { useSelector } from 'react-redux'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { questionsData } from 'src/store/reducers/tempDataSlice'
import dynamic from 'next/dynamic'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const ReviewAnswer = dynamic(() => import('src/components/Common/ReviewAnswer'), { ssr: false })

const Index = () => {

  const navigate = useRouter()

  const questions = useSelector(questionsData)

  const handleReviewAnswerBack = () => {
    navigate.push("/quiz-zone/result")
  }

  return (

    <Layout>
      <Breadcrumb title={`${t('quiz')} ${t('play')}`} content="" contentTwo="" />
      <div className='dashboard'>
        <div className='container'>
          <div className='row '>
            <div className='morphisam'>
              <div className='whitebackground'>
                <Suspense fallback={<QuestionSkeleton />}>
                  <ReviewAnswer
                    showLevel={true}
                    reviewlevel={true}
                    reportquestions={true}
                    questions={questions}
                    latex={true}
                    goBack={handleReviewAnswerBack}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>

  )
}

export default Index