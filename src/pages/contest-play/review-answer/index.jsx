"use client"
import { withTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { questionsData } from 'src/store/reducers/tempDataSlice'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import { t } from 'i18next'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { lazy, Suspense } from 'react'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const ReviewAnswer = lazy(() => import('src/components/view/common/QuestionSkeleton'))
const ContestPlayBoard = () => {

    const questions = useSelector(questionsData)

    const navigate = useRouter()

    const handleReviewAnswerBack = () => {
        navigate.push('/contest-play/result')
    }

    return (
        <Layout>
            <Breadcrumb title={t('contest_playBoard')} content="" contentTwo="" />
            <div className='funandlearnplay dashboard'>
                <div className='container'>
                    <div className='row '>
                        <div className='morphisam'>
                            <div className='whitebackground'>
                                <><Suspense fallback={<QuestionSkeleton />}>
                                    <ReviewAnswer showLevel={false} questions={questions} goBack={handleReviewAnswerBack} />
                                </Suspense>
                                </>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    )
}
export default withTranslation()(ContestPlayBoard)
