"use client"
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { withTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import { t } from 'i18next'
import { getQuizEndData, selectPercentage, selectResultTempData } from 'src/store/reducers/tempDataSlice'
import { useSelector } from 'react-redux'
import { lazy, Suspense } from 'react'
import ShowScoreSkeleton from 'src/components/view/common/ShowScoreSkeleton'
const ExamScore = lazy(() => import('src/components/Quiz/Exammodule/ExamScore'))
const ExamModulePlay = () => {

    const percentageScore = useSelector(selectPercentage)

    const showScore = useSelector(selectResultTempData);

    const resultScore = useSelector(getQuizEndData)

    return (
        <Layout>
            <Breadcrumb title={t('exam_module')} content="" contentTwo="" />
            <div className='dashboard selflearnig-play'>
                <div className='container'>
                    <div className='row '>
                        <div className='morphisam'>
                            <div className='whitebackground'>
                                <Suspense fallback={<ShowScoreSkeleton />}>
                                    <ExamScore
                                        score={percentageScore}
                                        totalQuestions={showScore.totalQuestions}
                                        coins={showScore.coins}
                                        quizScore={showScore.quizScore}
                                        showQuestions={true}
                                        corrAns={resultScore.Correctanswer}
                                        inCorrAns={resultScore.InCorrectanswer}
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
export default withTranslation()(ExamModulePlay)
