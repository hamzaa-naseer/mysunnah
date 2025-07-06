"use client"
import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import ProgressBar from 'react-bootstrap/ProgressBar';

import {
  decryptAnswer,
  calculateScore,
  calculateCoins,
  imgError,
  showAnswerStatusClass,
  audioPlay,
} from 'src/utils'
import { useDispatch, useSelector } from 'react-redux'
import {
  UserCoinScoreApi,
  UserStatisticsApi,
} from 'src/store/actions/campaign'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import rightTickIcon from 'src/assets/images/check-circle-score-screen.svg'
import crossIcon from 'src/assets/images/x-circle-score-screen.svg'
import { LoadQuizZoneCompletedata, percentageSuccess, questionsDataSuceess } from 'src/store/reducers/tempDataSlice'
import Timer from 'src/components/Common/Timer';
import QuestionTopSection from 'src/components/view/common/QuestionTopSection';
import QuestionMiddleSectionOptions from 'src/components/view/common/QuestionMiddleSectionOptions';
import { setSecondSnap, setTotalSecond } from 'src/store/reducers/showRemainingSeconds';


const TrueandFalseQuestions = ({
  t,
  questions: data,
  timerSeconds,
  onOptionClick,
  onQuestionEnd,
}) => {
  const [questions, setQuestions] = useState(data)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [corrAns, setCorrAns] = useState(0)
  const [inCorrAns, setInCorrAns] = useState(0)
  const child = useRef(null)
  const scroll = useRef(null)

  const systemconfig = useSelector(sysConfigdata)

  const dispatch = useDispatch()

  const Score = useRef(0)

  // store data get
  const userData = useSelector(state => state.User)

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
        category_id:questions[currentQuestion].category,
        percentage: percentage,
        onSuccess: response => { },
        onError: error => {
          console.log(error)
        }
      })
      userScore = await calculateScore(result_score, questions?.length, systemconfig?.true_false_quiz_correct_answer_credit_score, systemconfig?.true_false_quiz_wrong_answer_deduct_score)
      // console.log("userscore",userScore)
      let status = '0'
      if (percentage >= Number(systemconfig.quiz_winning_percentage)) {
        coins = await calculateCoins(Score.current, questions?.length)
        UserCoinScoreApi({
          coins: coins,
          score: userScore,
          title: `${t('True & False')} ${t('win')} `,
          status: status,
          onSuccess: response => {
            updateUserDataInfo(response.data)
          },
          onError: error => {
            console.log(error)
          }
        })
      } else {
        UserCoinScoreApi({
          score: userScore,
          title: `${t('True & False')} ${t('win')} `,
          status: status,
          onSuccess: response => {
            updateUserDataInfo(response.data)
          },
          onError: error => {
            console.log(error)
          }
        })
      }
      await onQuestionEnd(coins, userScore)

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

      let update_questions = questions.map(data => {
        return data.id === id ? { ...data, selected_answer: selected_option, isAnswered: true } : data
      })
      setQuestions(update_questions)
      setTimeout(() => {
        setNextQuestion()
      }, 1000)
      dispatch(percentageSuccess(result_score))
      onOptionClick(update_questions, result_score)
      dispatch(questionsDataSuceess(update_questions));
    }
    let seconds = child.current.getMinuteandSeconds()
    dispatch(setTotalSecond(timerSeconds))
    dispatch(setSecondSnap(seconds))

  }
  useEffect(() => {

    const queEnddatacorrect = corrAns;
    const queEnddataIncorrect = inCorrAns;

    LoadQuizZoneCompletedata(queEnddatacorrect, queEnddataIncorrect)

  }, [corrAns, inCorrAns])

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


  return (
    <>
      <div className='dashboardPlayUppDiv editTopMargin text-end p-2 pb-0'>

        <QuestionTopSection corrAns={corrAns} inCorrAns={inCorrAns} currentQuestion={currentQuestion} questions={questions} showAnswers={true} />

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
          </div>
        </div>


        <QuestionMiddleSectionOptions questions={questions} currentQuestion={currentQuestion} setAnswerStatusClass={setAnswerStatusClass} handleAnswerOptionClick={handleAnswerOptionClick} probability={false} latex={true} />
      </div>
    </>
  )
}

TrueandFalseQuestions.propTypes = {
  questions: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func.isRequired
}

TrueandFalseQuestions.defaultProps = {
  showLifeLine: true,
  showBookmark: true
}

export default withTranslation()(TrueandFalseQuestions)
