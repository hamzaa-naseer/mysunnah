import React, { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import Bookmark from '../../Common/Bookmark'
import { withTranslation } from 'react-i18next'
import Timer from 'src/components/Common/Timer'

import {
  decryptAnswer,
  calculateScore,
  calculateCoins,
  getAndUpdateBookmarkData,
  deleteBookmarkByQuestionID,
  showAnswerStatusClass,
  audioPlay
} from 'src/utils'
import { useDispatch, useSelector } from 'react-redux'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { setbookmarkApi, setQuizCategoriesApi, UserCoinScoreApi, UserStatisticsApi } from 'src/store/actions/campaign'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { LoadQuizZoneCompletedata, percentageSuccess, questionsDataSuceess, selecttempdata } from 'src/store/reducers/tempDataSlice'
import QuestionTopSection from 'src/components/view/common/QuestionTopSection'
import { setSecondSnap, setTotalSecond } from 'src/store/reducers/showRemainingSeconds'


const AudioQuestionsDashboard = ({
  t,
  questions: data,
  timerSeconds,
  onOptionClick,
  onQuestionEnd,
  showBookmark,
  showQuestions,
  isBookmarkPlay
}) => {
  const [questions, setQuestions] = useState(data)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [corrAns, setCorrAns] = useState(0)
  const [inCorrAns, setInCorrAns] = useState(0)
  const [totalTimerAudio, setTotalTimerAudio] = useState()
  const [currentTimeaudio, setCurrentTimeaudio] = useState(0)
  const [showAnswers, setShowAnswers] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [timerhide, setTimerhide] = useState(false)

  const child = useRef(null)
  const scroll = useRef(null)
  const audioRef = useRef(null)

  const dispatch = useDispatch()

  // store data get
  const userData = useSelector(state => state.User)

  let getData = useSelector(selecttempdata)

  const Score = useRef(0)

  const systemconfig = useSelector(sysConfigdata)

  const [answeredQuestions, setAnsweredQuestions] = useState({})

  const addAnsweredQuestion = item => {
    setAnsweredQuestions({ ...answeredQuestions, [item]: true })
  }

  // show answer button
  const ShowAnswersbtn = () => {
    // answershow
    setShowAnswers(true)
    // show button hide
    setHidden(true)
    // timer start
    setTimerhide(true)
  }

  // total audio timer value
  const onLoadedMetadata = () => {
    setTotalTimerAudio(parseInt(audioRef.current.duration))
  }

  // current audio timer value
  const handleTimeUpdate = () => {
    setCurrentTimeaudio(parseInt(audioRef.current.currentTime))
    // check audio condition

    // console.log("currentTimeaudio==>", currentTimeaudio, "totalTimerAudio==>", totalTimerAudio - 1);
    if (currentTimeaudio == totalTimerAudio - 1) {
      ShowAnswersbtn()
    }
  }

  setTimeout(() => {
    setQuestions(data)
  }, 500)

  const setNextQuestion = async () => {
    setShowAnswers(false)
    setHidden(false)
    setTimerhide(false)
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

      userScore = await calculateScore(result_score, questions?.length, systemconfig?.audio_quiz_correct_answer_credit_score, systemconfig?.audio_quiz_wrong_answer_deduct_score)
      let status = '0'
      if (percentage >= Number(systemconfig.quiz_winning_percentage)) {
        coins = await calculateCoins(Score.current, questions?.length)
        if (getData.is_play === "0") {
          UserCoinScoreApi({
            coins: coins,
            score: userScore,
            title: `${t('audio_quiz')} ${t('win')} `,
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
            title:`${t('audio_quiz')} ${t('lose')} `,
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


      // set quiz categories
      if (getData.is_play === '0') {
        if (getData.maincat_id && getData.id) {
          setQuizCategoriesApi({
            type: 4,
            category_id: getData.maincat_id,
            subcategory_id: getData.id,
            onSuccess: success => { },
            onError: error => {
              console.log(error)
            }
          })
        } else {
          setQuizCategoriesApi({
            type: 4,
            category_id: getData.id,
            onSuccess: success => { },
            onError: error => {
              console.log(error)
            }
          })
        }
      }

      await onQuestionEnd(coins, userScore)
    }
  }

  // button option answer check
  const handleAnswerOptionClick = selected_option => {
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

     {!isBookmarkPlay && audioPlay(selected_option, currentQuestionq.answer)}

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
  }

  // option answer status check
  const setAnswerStatusClass = option => {
    const currentIndex = currentQuestion;
    const currentQuestionq = questions[currentIndex];
    if (!isBookmarkPlay) {
      const color = showAnswerStatusClass(option, currentQuestionq.isAnswered, currentQuestionq.answer, currentQuestionq.selected_answer)
      return color
    }else{
      if (currentQuestionq.selected_answer == option) {
        return "bg-theme"
      } else {
        return
      }
    }
    
  }



  const handleBookmarkClick = (question_id, isBookmarked) => {
    let type = 4
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
    ShowAnswersbtn()
    setInCorrAns(inCorrAns + 1)

  }

  useEffect(() => {

    const queEnddatacorrect = corrAns;
    const queEnddataIncorrect = inCorrAns;

    LoadQuizZoneCompletedata(queEnddatacorrect, queEnddataIncorrect)

  }, [corrAns, inCorrAns])

  return (
    <React.Fragment>
      <div className='dashboardPlayUppDiv funLearnQuestionsUpperDiv text-end p-2 pb-0 audio_questions_top_margin'>
{!isBookmarkPlay &&
        <QuestionTopSection corrAns={corrAns} inCorrAns={inCorrAns} currentQuestion={currentQuestion} questions={questions} showBookmark={showBookmark} handleBookmarkClick={handleBookmarkClick} showAnswers={true} />
}
      </div>
      <div className='questions audioQuestiondashboard' ref={scroll}>
      <div className={isBookmarkPlay ? 'd-none' : "timerWrapper"}>
          <div className='inner__headerdash'>
            {timerhide ? (
              <div className='inner__headerdash'>
                {questions && questions[0]['id'] !== '' ? (
                  <Timer ref={child} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} />
                ) : (
                  ''
                )}
              </div>
            ) : (
              ''
            )}
          </div>
        </div>


        <div className='content__text'>
          <p className='question-text pt-4'>{questions[currentQuestion].question}</p>
        </div>

        {/* Audio Questions Player */}
        <div className='audio_player text-center pb-5'>
          <audio
            src={questions[currentQuestion].audio}
            controls
            autoPlay
            controlsList='nodownload noplaybackrate'
            id='audio'
            ref={audioRef}
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            style={{ border: '2px solid lightgray', borderRadius: '8px' }}
          />
        </div>

        {/* options */}
        <div className='row optionsWrapper'>
          {questions[currentQuestion].optiona ? (
            <div className='col-md-6 col-12'>
              <div className='inner__questions'>
                {showAnswers ? (
                  <button
                    className={`btn button__ui w-100 ${setAnswerStatusClass('a')}`}
                    onClick={e => handleAnswerOptionClick('a')}
                  >
                    <div className='row'>
                      <div className='col'>{questions[currentQuestion].optiona}</div>
                      {questions[currentQuestion].probability_a ? (
                        <div className='col text-end'>{questions[currentQuestion].probability_a}</div>
                      ) : (
                        ''
                      )}
                    </div>
                  </button>
                ) : (
                  '—'
                )}
              </div>
            </div>
          ) : (
            ''
          )}
          {questions[currentQuestion].optionb ? (
            <div className='col-md-6 col-12'>
              <div className='inner__questions'>
                {showAnswers ? (
                  <button
                    className={`btn button__ui w-100 ${setAnswerStatusClass('b')}`}
                    onClick={e => handleAnswerOptionClick('b')}
                  >
                    <div className='row'>
                      <div className='col'>{questions[currentQuestion].optionb}</div>
                      {questions[currentQuestion].probability_b ? (
                        <div className='col text-end'>{questions[currentQuestion].probability_b}</div>
                      ) : (
                        ''
                      )}
                    </div>
                  </button>
                ) : (
                  '—'
                )}
              </div>
            </div>
          ) : (
            ''
          )}
          {questions[currentQuestion].question_type === '1' ? (
            <>
              {questions[currentQuestion].optionc ? (
                <div className='col-md-6 col-12'>
                  <div className='inner__questions'>
                    {showAnswers ? (
                      <button
                        className={`btn button__ui w-100 ${setAnswerStatusClass('c')}`}
                        onClick={e => handleAnswerOptionClick('c')}
                      >
                        <div className='row'>
                          <div className='col'>{questions[currentQuestion].optionc}</div>
                          {questions[currentQuestion].probability_c ? (
                            <div className='col text-end'>{questions[currentQuestion].probability_c}</div>
                          ) : (
                            ''
                          )}
                        </div>
                      </button>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              ) : (
                ''
              )}
              {questions[currentQuestion].optiond ? (
                <div className='col-md-6 col-12'>
                  <div className='inner__questions'>
                    {showAnswers ? (
                      <button
                        className={`btn button__ui w-100 ${setAnswerStatusClass('d')}`}
                        onClick={e => handleAnswerOptionClick('d')}
                      >
                        <div className='row'>
                          <div className='col'>{questions[currentQuestion].optiond}</div>
                          {questions[currentQuestion].probability_d ? (
                            <div className='col text-end'>{questions[currentQuestion].probability_d}</div>
                          ) : (
                            ''
                          )}
                        </div>
                      </button>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              ) : (
                ''
              )}
              {questions[currentQuestion].optione !== "" ? (
                <div className='row d-flex justify-content-center mob_resp_e'>
                  <div className='col-md-6 col-12'>
                    <div className='inner__questions'>
                      {showAnswers ? (
                        <button
                          className={`btn button__ui w-100 ${setAnswerStatusClass('e')}`}
                          onClick={e => handleAnswerOptionClick('e')}
                        >
                          <div className='row'>
                            <div className='col'>{questions[currentQuestion].optione}</div>
                            {questions[currentQuestion].probability_e ? (
                              <div className='col' style={{ textAlign: 'right' }}>
                                {questions[currentQuestion].probability_e}
                              </div>
                            ) : (
                              ''
                            )}
                          </div>
                        </button>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ''
              )}
            </>
          ) : (
            ''
          )}
        </div>

        {/* <div className='divider'>
          <hr style={{ width: '112%', backgroundColor: 'gray', height: '2px' }} />
        </div> */}

        {/* show answers button */}
        <div className='show_btn_answers'>
          <button
            className={`btn btn-primary d-flex mx-auto my-5 ${hidden ? 'hideShowbutton' : ''}`}
            onClick={ShowAnswersbtn}
          >
            {t('show_option')}
          </button>
        </div>
      </div>
    </React.Fragment>
  )
}

AudioQuestionsDashboard.propTypes = {
  questions: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func.isRequired
}

AudioQuestionsDashboard.defaultProps = {
  showBookmark: true
}

export default withTranslation()(AudioQuestionsDashboard)
