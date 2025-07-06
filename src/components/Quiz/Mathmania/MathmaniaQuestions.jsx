import React, { useState, useRef, useEffect, Suspense, lazy } from 'react'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import Timer from "src/components/Common/Timer";
import {
  decryptAnswer,
  calculateScore,
  calculateCoins,
  getAndUpdateBookmarkData,
  deleteBookmarkByQuestionID,
  imgError,
  showAnswerStatusClass,
  audioPlay,
} from 'src/utils'
import { useDispatch, useSelector } from 'react-redux'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { setbookmarkApi, setQuizCategoriesApi, UserCoinScoreApi, UserStatisticsApi } from 'src/store/actions/campaign'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { LoadQuizZoneCompletedata, percentageSuccess, questionsDataSuceess, resultTempDataSuccess, selecttempdata } from 'src/store/reducers/tempDataSlice'
import { useRouter } from 'next/router'
import { t } from 'i18next'
import QuestionTopSection from 'src/components/view/common/QuestionTopSection'
import { setSecondSnap, setTotalSecond } from 'src/store/reducers/showRemainingSeconds';
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton';
const QuestionMiddleSectionOptions = lazy(() => import('src/components/view/common/QuestionMiddleSectionOptions'))
const MathmaniaQuestions = ({
  questions: data,
  timerSeconds,
  onOptionClick,
  showBookmark,
}) => {
  const [questions, setQuestions] = useState(data)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [corrAns, setCorrAns] = useState(0)
  const [inCorrAns, setInCorrAns] = useState(0)
  const child = useRef(null)
  const scroll = useRef(null)

  const Score = useRef(0)

  const systemconfig = useSelector(sysConfigdata)

  const dispatch = useDispatch();


  const router = useRouter()

  // store data get
  const userData = useSelector(state => state.User)

  let getData = useSelector(selecttempdata)

  const [answeredQuestions, setAnsweredQuestions] = useState({})

  const addAnsweredQuestion = item => {
    setAnsweredQuestions({ ...answeredQuestions, [item]: true })
  }

  setTimeout(() => {
    setQuestions(data)
  }, 500)

  const setNextQuestion = async () => {
    const nextQuestion = currentQuestion + 1
    if (nextQuestion < questions?.length) {
      setCurrentQuestion(nextQuestion)
      child.current.resetTimer()
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
      userScore = await calculateScore(result_score, questions?.length, systemconfig?.maths_quiz_correct_answer_credit_score, systemconfig?.maths_quiz_wrong_answer_deduct_score)
      let status = '0'
      if (percentage >= Number(systemconfig.quiz_winning_percentage)) {
        coins = await calculateCoins(Score.current, questions?.length)
        if (getData.is_play === "0") {
          UserCoinScoreApi({
            coins: coins,
            score: userScore,
            title: `${t('Math Mania')} ${t('win')} `,
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
            title: `${t('Math Mania')} ${t('lose')} `,
            statusL: status,
            onSuccess: response => {
              updateUserDataInfo(response.data)
            },
            onError: error => {
              console.log(error)
            }
          })
        }
      }
      // setTimeout(async () => {
      await onQuestionEnd(coins, userScore)
      // }, 2000)
      // set quiz categories
      if (getData.is_play === '0') {
        if (getData.maincat_id && getData.id) {
          setQuizCategoriesApi({
            type: 5,
            category_id: getData.maincat_id,
            subcategory_id: getData.id,
            onSuccess: success => { },
            onError: error => {
              console.log(error)
            }
          })
        } else {
          setQuizCategoriesApi({
            type: 5,
            category_id: getData.id,
            onSuccess: success => { },
            onError: error => {
              console.log(error)
            }
          })
        }
      }
    }
  }

  const onQuestionEnd = async (coins, userScore) => {
    const tempData = {
      totalQuestions: questions?.length,
      coins: coins,
      quizScore: userScore,
    };
    dispatch(resultTempDataSuccess(tempData));
    await router.push("/math-mania/result")
  }


  // button option answer check
  const handleAnswerOptionClick = async selected_option => {

    let seconds = child.current.getMinuteandSeconds()


    dispatch(setTotalSecond(timerSeconds))
    dispatch(setSecondSnap(seconds))


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

      let update_questions = questions.map(data => {
        return data.id === id ? { ...data, selected_answer: selected_option, isAnswered: true } : data
      })
      setQuestions(update_questions)
      setTimeout(async () => {
        await setNextQuestion()
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

  const handleBookmarkClick = (question_id, isBookmarked) => {
    let type = 5
    let bookmark = '0'

    if (isBookmarked) bookmark = '1'
    else bookmark = '0'

    return setbookmarkApi({
      question_id: question_id,
      bookmark: bookmark,
      type: type,
      onSuccess: response => {
        if (response.error) {
          toast.error(t('not_remove_que'))
          return false
        } else {
          if (isBookmarked) {
            getAndUpdateBookmarkData(type)
          } else {
            deleteBookmarkByQuestionID(question_id)
          }
          return true
        }
      },
      onError: error => {
        console.error(error)
      }
    })
  }

  const onTimerExpire = () => {
    setNextQuestion()
    setInCorrAns(inCorrAns + 1)

  }
  useEffect(() => {
    const queEnddatacorrect = corrAns;
    const queEnddataIncorrect = inCorrAns;
    LoadQuizZoneCompletedata(queEnddatacorrect, queEnddataIncorrect)
  }, [corrAns, inCorrAns])

  return (
    <React.Fragment>
      <div className='dashboardPlayUppDiv funLearnQuestionsUpperDiv text-end p-2 pb-0'>
        <QuestionTopSection corrAns={corrAns} inCorrAns={inCorrAns} currentQuestion={currentQuestion} questions={questions} showBookmark={showBookmark} handleBookmarkClick={handleBookmarkClick} showAnswers={true} />
      </div>
      <div className='questions' ref={scroll}>

        <div className="timerWrapper">
          <div className='inner__headerdash'>

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

        <Suspense fallback={<QuestionSkeleton />}>
          <QuestionMiddleSectionOptions questions={questions} currentQuestion={currentQuestion} setAnswerStatusClass={setAnswerStatusClass} handleAnswerOptionClick={handleAnswerOptionClick} probability={false} latex={true} math={true} />
        </Suspense>
      </div>
    </React.Fragment>
  )
}

MathmaniaQuestions.propTypes = {
  questions: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func.isRequired
}

MathmaniaQuestions.defaultProps = {
  showBookmark: false
}

export default withTranslation()(MathmaniaQuestions)
