"use client"
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { withTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { questionsData } from 'src/store/reducers/tempDataSlice'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import { t } from 'i18next'
import { lazy, Suspense } from 'react'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const RandomReviewAnswer = lazy(() => import('src/components/Quiz/RandomBattle/RandomReviewAnswer'))

const RandomPlay = () => {

    const navigate = useRouter()

    const questions = useSelector(questionsData)

    const handleReviewAnswerBack = () => {
        navigate.push("/random-battle/result")
    }

    return (
        <Layout>
            <Breadcrumb title={t('1 v/s 1 Battle')} content="" contentTwo="" />
            <div className='funandlearnplay dashboard battlerandom'>
                <div className='container'>
                    <div className='row '>
                        <div className='morphisam'>
                            <div className='whitebackground'>
                                <><Suspense fallback={<QuestionSkeleton />}>
                                    <RandomReviewAnswer questions={questions} goBack={handleReviewAnswerBack} />
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
export default withTranslation()(RandomPlay)
