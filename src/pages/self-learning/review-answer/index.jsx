"use client"
import { t } from 'i18next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { Suspense } from 'react'
import { useSelector } from 'react-redux'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const ReviewAnswer = dynamic(() => import('src/components/Common/ReviewAnswer'), { ssr: false })

import { questionsData } from 'src/store/reducers/tempDataSlice'

const Index = () => {

    const navigate = useRouter()

    const questions = useSelector(questionsData)

    const handleReviewAnswerBack = () => {
        navigate.push("/self-learning/result")
    }

    return (
        <Layout>
            <Breadcrumb title={t('Self Challenge')} content="" contentTwo="" />
            <div className='dashboard selflearnig-play'>
                <div className='container'>
                    <div className='row '>
                        <div className='morphisam'>
                            <div className='whitebackground'>
                                <Suspense fallback={<QuestionSkeleton />}>
                                    <ReviewAnswer
                                        reportquestions={true}
                                        reviewlevel={false}
                                        questions={questions}
                                        showLevel={false}
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