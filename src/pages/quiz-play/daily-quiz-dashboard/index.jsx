"use client"
import { lazy, Suspense, useEffect, useState } from 'react'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { withTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { dailyQuizApi, getusercoinsApi, setBadgesApi, UserCoinScoreApi } from "src/store/actions/campaign";
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { badgesData, LoadNewBadgesData } from 'src/store/reducers/badgesSlice'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { reviewAnswerShowSuccess } from 'src/store/reducers/tempDataSlice'
import { useRouter } from 'next/router'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'

const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const DailyQuizQuestions = lazy(() => import('src/components/Quiz/DailyQuiz/DailyQuizQuestions'))
const DailyQuizDashboard = ({ t }) => {

  const [questions, setQuestions] = useState([{ id: '', isBookmarked: false }])

  const systemconfig = useSelector(sysConfigdata)

  const dispatch = useDispatch()

  const navigate = useRouter()

  const Badges = useSelector(badgesData)

  const thirstyBadge = Badges?.data?.find(badge => badge?.type === 'thirsty');

  const thirsty_status = thirstyBadge && thirstyBadge?.status

  const thirsty_coin = thirstyBadge && thirstyBadge?.badge_reward

  let timerseconds = parseInt(systemconfig.quiz_zone_duration);

  const TIMER_SECONDS = timerseconds;

  useEffect(() => {
    getNewQuestions()
    dispatch(reviewAnswerShowSuccess(false))
  }, [])

  const getNewQuestions = () => {
    dailyQuizApi({
      onSuccess: (response) => {
        if (response.data && !response.data.error) {
          let questions = response.data.map((data) => {

            let question = data.question

            let note = data?.note

            return {
              ...data,
              note: note,
              question: question,
              selected_answer: "",
              isAnswered: false,
            };
          });
          // console.log("que",questions)
          setQuestions(questions);
        }
      },
      onError: (error) => {
        if (error === "112") {
          toast.error(t("already_played"));
          navigate.push('/quiz-play')
          return false;
        }

        if (error === "102") {
          toast.error(t("no_que_found"));
          navigate.push("/quiz-play");

          return false;;
        }

      }
    });
  };




  const handleAnswerOptionClick = (questions) => {
    setQuestions(questions)
  }


  useEffect(() => {
    if (thirsty_status === '0') {
      setBadgesApi(
        'thirsty',
        (res) => {
          LoadNewBadgesData('thirsty', '1')
          toast.success(t(res?.data?.notification_body))
          const status = 0
          UserCoinScoreApi({
            coins: thirsty_coin,
            title: t('thirsty_badge_reward'),
            status: status,
            onSuccess: response => {
              getusercoinsApi({
                onSuccess: responseData => {
                  updateUserDataInfo(responseData.data)
                },
                onError: error => {
                  console.log(error)
                }
              })
            },
            onError: error => {
              console.log(error)
            }
          })
        },
        error => {
          console.log(error)
        }
      )
    }
  }, [])



  return (
    <Layout>
      <Breadcrumb title={`${t('daily')} ${t('quiz')}`} content="" contentTwo="" />
      <div className='dashboard'>
        <div className='container'>
          <div className='row'>
            <div className='morphisam'>
              <div className='whitebackground'>
                {(() => {
                  if (questions && questions?.length >= 0) {
                    return (
                      <Suspense fallback={<QuestionSkeleton />}>
                        <DailyQuizQuestions
                          questions={questions}
                          timerSeconds={TIMER_SECONDS}
                          onOptionClick={handleAnswerOptionClick}
                          showQuestions={true}
                          showLifeLine={true}
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

export default withTranslation()(DailyQuizDashboard)
