"use client"
import Breadcrumb from 'src/components/Common/Breadcrumb.jsx'
import { withTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { questionsData } from 'src/store/reducers/tempDataSlice'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import { t } from 'i18next'
import { lazy, Suspense } from 'react'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const AudioReviewAnswer = lazy(() => import('src/components/Quiz/AudioQuestions/AudioQuestionReview'))
const AudioQuestionsPlay = () => {

    const navigate = useRouter()

    const questions = useSelector(questionsData)

    const handleReviewAnswerBack = () => {
        navigate.push("/audio-questions/result")
    }

    return (
        <Layout>
            <Breadcrumb title={t('AudioQuestionsPlay')} content="" contentTwo="" />
            <div className='funandlearnplay AudioQuestionsPlay dashboard'>
                <div className='container'>
                    <div className='row '>
                        <div className='morphisam'>
                            <div className='whitebackground'>
                                <Suspense fallback={<QuestionSkeleton />}>
                                    <AudioReviewAnswer
                                        reportquestions={false}
                                        questions={questions}
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
export default withTranslation()(AudioQuestionsPlay)
