import React, { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { decryptAnswer, calculateScore, calculateCoins, showAnswerStatusClass, audioPlay } from 'src/utils'
import { useDispatch, useSelector } from 'react-redux'
import {
  getusercoinsApi,
  setBadgesApi,
  setQuizCategoriesApi,
  UserCoinScoreApi,
  UserStatisticsApi
} from 'src/store/actions/campaign'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { LoadQuizZoneCompletedata, percentageSuccess, questionsDataSuceess, selecttempdata } from 'src/store/reducers/tempDataSlice'
import { badgesData, LoadNewBadgesData } from 'src/store/reducers/badgesSlice'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import Timer from "src/components/Common/Timer";
import QuestionTopSection from 'src/components/view/common/QuestionTopSection'
import QuestionMiddleSectionOptions from 'src/components/view/common/QuestionMiddleSectionOptions'
import { setSecondSnap } from 'src/store/reducers/showRemainingSeconds'

const FunandLearnQuestions = ({
  t,
  questions: data,
  timerSeconds,
  onOptionClick,
  onQuestionEnd,
  showBookmark,
  showQuestions
}) => {
  const [questions, setQuestions] = useState(data)
  const [corrAns, setCorrAns] = useState(0)
  const [inCorrAns, setInCorrAns] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const child = useRef(null)
  const scroll = useRef(null)
  const [questionCount, setQuestionCount] = useState(0)

  const systemconfig = useSelector(sysConfigdata)

  // store data get
  const userData = useSelector(state => state.User)

  const Score = useRef(0)

  const Badges = useSelector(badgesData)

  const dispatch = useDispatch()

  const flashbackBadge = Badges?.data?.find(badge => badge?.type === 'flashback');

  const flashback_status = flashbackBadge && flashbackBadge?.status

  const flashback_coin = flashbackBadge && flashbackBadge?.badge_reward

  let getData = useSelector(selecttempdata)

  setTimeout(() => {
    setQuestions(data)
  }, 500)

  const [answeredQuestions, setAnsweredQuestions] = useState({})

  const addAnsweredQuestion = item => {
    setAnsweredQuestions({ ...answeredQuestions, [item]: true })
  }

  const setNextQuestion = async () => {
    const nextQuestion = currentQuestion + 1
    if (nextQuestion < questions?.length) {
      setCurrentQuestion(nextQuestion)
      child?.current?.resetTimer()
    } else {
      let coins = null
      let userScore = null

      let result_score = Score.current
      let percentage = (100 * result_score) / questions?.length
      UserStatisticsApi({
        questions_answered: questions?.length,
        correct_answers: result_score,
        category_id: questions[currentQuestion].category,
        percentage: percentage,
        onSuccess: response => { },
        onError: error => {
          console.log(error)
        }
      })
      userScore = await calculateScore(result_score, questions?.length, systemconfig?.fun_n_learn_quiz_correct_answer_credit_score, systemconfig?.fun_n_learn_quiz_wrong_answer_deduct_score)
      // console.log("userscore",userScore)
      let status = '0'

      if (percentage >= Number(systemconfig.quiz_winning_percentage)) {
        coins = await calculateCoins(Score.current, questions?.length)
        if (getData.is_play === "0") {
          UserCoinScoreApi({
            coins: coins,
            score: userScore,
            title: t('Fun and Play Quiz Win'),
            status: status,
            onSuccess: response => {
              updateUserDataInfo(response.data)
            },
            onError: error => {
              console.log(error)
            }
          })
        }

      } else {
        if (getData.is_play === "0") {
          UserCoinScoreApi({
            score: userScore,
            title: t('Fun and Play Quiz Win'),
            status: status,
            onSuccess: response => {
              updateUserDataInfo(response.data)
            },
            onError: error => {
              console.log(error)
            }
          })
        }
      }

      await onQuestionEnd(coins, userScore)

      // console.log(getData.is_play, typeof (getData.is_play))
      // set quiz categories api
      if (getData.is_play === '0') {
        // console.log("hello")
        setQuizCategoriesApi({
          type: 2,
          category_id: getData.category,
          subcategory_id: getData.subcategory,
          type_id: getData.id,
          onSuccess: success => { },
          onError: error => {
            console.log(error)
          }
        })
      }
    }
  }


  // button option answer check
  const handleAnswerOptionClick = selected_option => {
    if (!answeredQuestions.hasOwnProperty(currentQuestion)) {
      addAnsweredQuestion(currentQuestion)

      let { id, answer } = questions[currentQuestion]

      let decryptedAnswer = decryptAnswer(answer, userData?.data?.firebase_id)
      let result_score = Score.current
      if (decryptedAnswer === selected_option) {
        result_score++
        Score.current = result_score
        setCorrAns(corrAns + 1)
      } else {
        setInCorrAns(inCorrAns + 1)
      }

      // this for only audio
      const currentIndex = currentQuestion;

      const currentQuestionq = questions[currentIndex];

      audioPlay(selected_option, currentQuestionq.answer)

      let seconds = child.current.getMinuteandSeconds()

      let update_questions = questions.map(data => {
        return data.id === id
          ? { ...data, selected_answer: selected_option, isAnswered: true, timer_seconds: seconds }
          : data
      })
      let snap = update_questions[questionCount].timer_seconds
      dispatch(setSecondSnap(snap))



      setQuestionCount((pre) => pre + 1)
      checktotalQuestion(update_questions)
      setQuestions(update_questions)
      setTimeout(() => {
        setNextQuestion()
      }, 1000)
      dispatch(percentageSuccess(result_score))
      onOptionClick(update_questions, result_score)
      dispatch(questionsDataSuceess(update_questions));
    }
  }

  // option answer status check
  const setAnswerStatusClass = option => {
    const currentIndex = currentQuestion;
    const currentQuestionq = questions[currentIndex];
    const color = showAnswerStatusClass(option, currentQuestionq.isAnswered, currentQuestionq.answer, currentQuestionq.selected_answer)
    return color
  }

  const onTimerExpire = () => {
    setNextQuestion()
    setInCorrAns(inCorrAns + 1)

  }

  // flashback badge logic
  const checktotalQuestion = update_question => {
    if (questions?.length < 5) {
      return
    }
    const allTimerSeconds = update_question
      .map(quizDataObj => quizDataObj.timer_seconds)
      .filter(timerSeconds => timerSeconds <= 8)
    if (flashback_status === '0' && allTimerSeconds?.length == 5) {
      setBadgesApi(
        'flashback',
        (res) => {
          LoadNewBadgesData('flashback', '1')
          toast.success(t(res?.data?.notification_body))
          const status = 0
          if (getData.is_play === "0") {
            UserCoinScoreApi({
              coins: flashback_coin,
              title: t('flashback_badge_reward'),
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
          }
        },
        error => {
          console.log(error)
        }
      )
    }
  }
  // for update correct and incorrect ans in redux 
  useEffect(() => {

    const queEnddatacorrect = corrAns;
    const queEnddataIncorrect = inCorrAns;

    LoadQuizZoneCompletedata(queEnddatacorrect, queEnddataIncorrect)

  }, [corrAns, inCorrAns])

  return (
    <React.Fragment>
      <div className='dashboardPlayUppDiv funLearnQuestionsUpperDiv text-end p-2 pb-0'>
        <QuestionTopSection corrAns={corrAns} inCorrAns={inCorrAns} currentQuestion={currentQuestion} questions={questions} showAnswers={true} />
      </div>

      <div className='questions' ref={scroll}>
        <div className="timerWrapper">

          <div className='inner__headerdash'>
            {showQuestions ? (
              <div className='leveldata'>
                <h5 className='inner-level__data '>
                  {t('level')} : {questions[currentQuestion].level}
                </h5>
              </div>
            ) : (
              ''
            )}

            <div className='inner__headerdash'>
              {questions && questions[0]['id'] !== '' ? (
                <Timer ref={child} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} />
              ) : (
                ''
              )}
            </div>

            <div>
            </div>
          </div>
        </div>


        <QuestionMiddleSectionOptions questions={questions} currentQuestion={currentQuestion} setAnswerStatusClass={setAnswerStatusClass} handleAnswerOptionClick={handleAnswerOptionClick} probability={false} latex={false} />
      </div>
    </React.Fragment>
  )
}

FunandLearnQuestions.propTypes = {
  questions: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func.isRequired
}

FunandLearnQuestions.defaultProps = {
  showBookmark: true
}

export default withTranslation()(FunandLearnQuestions)
