"use client"
import { lazy, Suspense, useEffect, useState } from 'react'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import toast from 'react-hot-toast'
import { withTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { funandlearnquestionsApi } from 'src/store/actions/campaign'
import { useRouter } from 'next/router'
import { resultTempDataSuccess, selecttempdata } from 'src/store/reducers/tempDataSlice'
import { t } from 'i18next'
import dynamic from 'next/dynamic'
import { setTotalSecond } from 'src/store/reducers/showRemainingSeconds'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const FunandLearnQuestions = lazy(() => import('src/components/Quiz/Fun_and_Learn/FunandLearnQuestions'))
const FunandLearnPlay = () => {

  let getData = useSelector(selecttempdata)

  const navigate = useRouter()

  const dispatch = useDispatch()

  const [questions, setQuestions] = useState([{ id: '', isBookmarked: false }])

  const [detail, setDetail] = useState(true)

  // store data get
  const systemconfig = useSelector(sysConfigdata)

  const timerseconds = Number(systemconfig.fun_and_learn_time_in_seconds)
  dispatch(setTotalSecond(timerseconds))
  const TIMER_SECONDS = timerseconds

  useEffect(() => {
    if (getData) {
      getNewQuestions(getData.id)
    }
  }, [])

  const getNewQuestions = fun_n_learn_id => {
    funandlearnquestionsApi({
      fun_n_learn_id: fun_n_learn_id,
      onSuccess: response => {
        let questions = response.data.map(data => {
          return {
            ...data,
            selected_answer: '',
            isAnswered: false
          }
        })
        setQuestions(questions)
      },
      onError: error => {
        toast.error(t('no_que_found'))
        // router.push('/quiz-play')
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
      playAgain: false,
      nextlevel: false
    };



    // Dispatch the action with the data
    dispatch(resultTempDataSuccess(tempData));
    await navigate.push("/fun-and-learn/result")
  }

  return (
    <Layout>
      <Breadcrumb title={`${t('fun_and_learn')} ${t('play')} `} content="" contentTwo="" />
      <div className='funandlearnplay dashboard'>
        <div className='container'>
          <div className='row '>
            <div className='morphisam'>
              {detail ? (
                <div className='text-center my-5 funLearnTextData'>
                  <h2 className='funLearntitle'>{getData?.title}</h2>
                  <h4
                    className='fun__title pb-3'
                    dangerouslySetInnerHTML={{ __html: getData && getData?.detail }}
                  ></h4>
                  <button className='btn btn-primary playBtn' onClick={e => setDetail(false)}>
                    {t('l_start')}
                  </button>
                </div>
              ) : (
                <div className='whitebackground'>
                  {(() => {
                    if (questions && questions?.length >= 0) {
                      return (
                        <Suspense fallback={<QuestionSkeleton />}>
                          <FunandLearnQuestions
                            questions={questions}
                            timerSeconds={TIMER_SECONDS}
                            onOptionClick={handleAnswerOptionClick}
                            onQuestionEnd={onQuestionEnd}
                            showQuestions={false}
                            showLifeLine={false}
                            showGuesstheword={false}
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
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
export default withTranslation()(FunandLearnPlay)
