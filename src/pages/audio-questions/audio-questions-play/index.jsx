"use client"
import { lazy, Suspense, useEffect, useState } from 'react'
import Breadcrumb from 'src/components/Common/Breadcrumb.jsx'
import toast from 'react-hot-toast'
import { withTranslation } from 'react-i18next'
import { getBookmarkData } from 'src/utils'
import { useDispatch, useSelector } from 'react-redux'
import { resultTempDataSuccess } from 'src/store/reducers/tempDataSlice'
import { audioquestionsApi } from 'src/store/actions/campaign'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import { t } from 'i18next'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const AudioQuestionsDashboard = lazy(() => import('src/components/Quiz/AudioQuestions/AudioQuestionsDashboard'))
const AudioQuestionsPlay = () => {

  const dispatch = useDispatch()

  const router = useRouter()

  const [questions, setQuestions] = useState([{ id: '', isBookmarked: false }])

  const systemconfig = useSelector(sysConfigdata)

  const TIMER_SECONDS = Number(systemconfig?.audio_quiz_seconds)

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.isSubcategory !== '0') {
      getNewQuestions('subcategory', router.query.subcatid)
    } else {
      getNewQuestions('category', router.query.catid)
    }

  }, [router.isReady]);

  const getNewQuestions = (type, type_id) => {
    audioquestionsApi({
      type: type,
      type_id: type_id,
      onSuccess: response => {
        let bookmark = getBookmarkData()
        let questions_ids = Object.keys(bookmark).map(index => {
          return bookmark[index].question_id
        })
        let questions = response.data.map(data => {
          let isBookmark = false
          if (questions_ids.indexOf(data.id) >= 0) {
            isBookmark = true
          } else {
            isBookmark = false
          }
          return {
            ...data,
            isBookmarked: isBookmark,
            selected_answer: '',
            isAnswered: false
          }
        })
        setQuestions(questions)
      },
      onError: error => {
        toast.error(t('no_que_found'))
        router.push('/quiz-play')
        console.log(error)
      }
    })
  }

  const handleAnswerOptionClick = (questions) => {
    setQuestions(questions)
  }

  const onQuestionEnd = async (coins, quizScore) => {
    const tempData = {
      totalQuestions: questions?.length,
      coins: coins,
      quizScore: quizScore,
    };
    // Dispatch the action with the data
    dispatch(resultTempDataSuccess(tempData));
    await router.push("/audio-questions/result")
  }


  return (
    <Layout>
      <Breadcrumb title={t('AudioQuestionsPlay')} content="" contentTwo="" />
      <div className='funandlearnplay AudioQuestionsPlay dashboard'>
        <div className='container'>
          <div className='row '>
            <div className='morphisam'>
              <div className='whitebackground'>
                {(() => {
                  if (questions && questions?.length >= 0) {
                    return (
                      <Suspense fallback={<QuestionSkeleton />}>
                        <AudioQuestionsDashboard
                          questions={questions}
                          timerSeconds={TIMER_SECONDS}
                          onOptionClick={handleAnswerOptionClick}
                          onQuestionEnd={onQuestionEnd}
                          isBookmarkPlay={false}
                        />
                      </Suspense>
                    )
                  } else {
                    return (
                      <div className='text-center text-white'>
                        <p>{t('no_que_found')}</p>
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
export default withTranslation()(AudioQuestionsPlay)
