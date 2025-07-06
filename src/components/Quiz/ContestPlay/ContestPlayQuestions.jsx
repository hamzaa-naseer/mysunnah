import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import Timer from 'src/components/Common/Timer'
import { decryptAnswer, calculateScore, calculateCoins, imgError, showAnswerStatusClass } from 'src/utils'
import { useDispatch, useSelector } from 'react-redux'
import {
  setcontestleaderboardApi,
  UserCoinScoreApi,
  UserStatisticsApi
} from 'src/store/actions/campaign'
import { LoadQuizZoneCompletedata, percentageSuccess, questionsDataSuceess, selecttempdata } from 'src/store/reducers/tempDataSlice'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import QuestionTopSection from 'src/components/view/common/QuestionTopSection'
import QuestionMiddleSectionOptions from 'src/components/view/common/QuestionMiddleSectionOptions'
import { setSecondSnap, setTotalSecond } from 'src/store/reducers/showRemainingSeconds'

const ContestPlayQuestions = ({
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
  let getData = useSelector(selecttempdata)

  const systemconfig = useSelector(sysConfigdata)

  setTimeout(() => {
    setQuestions(data)
  }, 500)

  const Score = useRef(0)

  const dispatch = useDispatch()

  // store data get
  const userData = useSelector(state => state.User)

  const [answeredQuestions, setAnsweredQuestions] = useState({})

  const addAnsweredQuestion = item => {
    setAnsweredQuestions({ ...answeredQuestions, [item]: true })
  }

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

      userScore = await calculateScore(result_score, questions?.length, systemconfig?.contest_mode_correct_credit_score, systemconfig?.contest_mode_wrong_deduct_score)
      let status = '0'
      if (percentage >= Number(systemconfig.quiz_winning_percentage)) {
        coins = await calculateCoins(Score.current, questions?.length)
        UserCoinScoreApi({
          coins: coins,
          score: userScore,
          title: `${t('contestPlay')} ${t('quiz_win')} `,
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

      // let correctAnswer = JSON.stringify(result_score)
      setcontestleaderboardApi({
        contest_id: getData.contest_id,
        questions_attended: questions?.length,
        correct_answers: result_score,
        score: userScore,
        onSuccess: response => { },
        onError: error => {
          console.log(error)
        }
      })
    }
  }

  // button option answer check
  const handleAnswerOptionClick = async (selected_option) => {

    let seconds = child.current.getMinuteandSeconds()
    dispatch(setTotalSecond(timerSeconds))
    dispatch(setSecondSnap(seconds))


    if (!answeredQuestions.hasOwnProperty(currentQuestion)) {
      addAnsweredQuestion(currentQuestion);

      let { id, answer } = questions[currentQuestion];

      let decryptedAnswer = decryptAnswer(answer, userData?.data?.firebase_id);
      let result_score = Score.current;

      if (decryptedAnswer === selected_option) {
        result_score++;
        Score.current = result_score
        setCorrAns(corrAns + 1)
        // rightClick.play();
      } else {
        // wrongClick.play();
        setInCorrAns(inCorrAns + 1)
      }

      let update_questions = questions.map((data) => {
        return data.id === id ? { ...data, selected_answer: selected_option, isAnswered: true } : data;
      });
      setQuestions(update_questions);
      setTimeout(() => {
        setNextQuestion();
      }, 1000);
      dispatch(percentageSuccess(result_score))
      onOptionClick(update_questions, result_score);
      dispatch(questionsDataSuceess(update_questions));
    }
  };

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

      <div className='questions contestque' ref={scroll}>
        <div className="timerWrapper">
          <div className='inner__headerdash '>
            {questions && questions[0]['id'] !== '' ? (
              <Timer ref={child} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} />
            ) : (
              ''
            )}
          </div>
        </div>

        <QuestionMiddleSectionOptions questions={questions} currentQuestion={currentQuestion} setAnswerStatusClass={setAnswerStatusClass} handleAnswerOptionClick={handleAnswerOptionClick} probability={false} latex={false} />
      </div>
    </React.Fragment>
  )
}

ContestPlayQuestions.propTypes = {
  questions: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func.isRequired
}

export default withTranslation()(ContestPlayQuestions)
