"use client"
import React, { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import Lifelines from './Lifelines'
import { withTranslation } from 'react-i18next'

import {
  decryptAnswer,
  calculateScore,
  calculateCoins,
  getAndUpdateBookmarkData,
  deleteBookmarkByQuestionID,
  showAnswerStatusClass,
  audioPlay,
} from 'src/utils'
import { useDispatch, useSelector } from 'react-redux'
import {
  setBadgesApi,
  leveldataApi,
  levelDataApi,
  setbookmarkApi,
  UserCoinScoreApi,
  UserStatisticsApi,
  getusercoinsApi
} from 'src/store/actions/campaign'
import { badgesData, LoadNewBadgesData } from 'src/store/reducers/badgesSlice'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { LoadQuizZoneCompletedata, LoadQuizZonepercentage, percentageSuccess, questionsDataSuceess } from 'src/store/reducers/tempDataSlice'
import Timer from './Timer'
import QuestionTopSection from '../view/common/QuestionTopSection'
import QuestionMiddleSectionOptions from '../view/common/QuestionMiddleSectionOptions'
import { setSecondSnap, setTotalSecond } from 'src/store/reducers/showRemainingSeconds'

const Question = ({
  t,
  questions: data,
  timerSeconds,
  onOptionClick,
  onQuestionEnd,
  showLifeLine,
  showBookmark,
  showQuestions,
  unlockedLevel,
  currentLevel
}) => {
  const [questions, setQuestions] = useState(data)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [corrAns, setCorrAns] = useState(0)
  const [inCorrAns, setInCorrAns] = useState(0)
  const child = useRef(null)
  const scroll = useRef(null)
  const fiftyFiftyClicked = useRef(false)
  const audiencePollClicked = useRef(false)
  const timerResetClicked = useRef(false)
  const skipQuestionClicked = useRef(false)

  const systemconfig = useSelector(sysConfigdata)

  const Badges = useSelector(badgesData)

  const totalSecond = useSelector(state => state.showSeconds.totalSecond)

  const dispatch = useDispatch()

  const Score = useRef(0)

  // Find the object with type 'brainiac'
  const brainiacBadge = Badges?.data?.find(badge => badge?.type === 'brainiac');

  const dashingBadge = Badges?.data?.find(badge => badge?.type === 'dashing_debut');

  const brainiac_status = brainiacBadge && brainiacBadge?.status

  const brainiac_coin = brainiacBadge && brainiacBadge?.badge_reward

  const dashingdebut_status = dashingBadge && dashingBadge?.status

  const dashing_debut_coin = dashingBadge && dashingBadge?.badge_reward

  // store data get
  const userData = useSelector(state => state.User)

  // const rightclick = new Audio(rightClick);

  // const wrongclick = new Audio(wrongClick);

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
      userScore = await calculateScore(result_score, questions?.length, systemconfig?.quiz_zone_correct_answer_credit_score, systemconfig?.quiz_zone_wrong_answer_deduct_score)

      let status = '0'
      if (percentage >= Number(systemconfig.quiz_winning_percentage)) {
        coins = await calculateCoins(Score.current, questions?.length)
        if (unlockedLevel <= currentLevel) {
          LoadQuizZonepercentage(true)

          UserCoinScoreApi({
            coins: coins,
            score: userScore,
            title: 'Quiz Zone Win',
            status: status,
            onSuccess: response => {
              updateUserDataInfo(response.data)
            },
            onError: error => {
              console.log(error)
            }
          })
        } else {
          LoadQuizZonepercentage(false)
        }
        // get level data api
        levelDataApi({
          category_id: questions[currentQuestion].category_slug,
          subcategory_id: questions[currentQuestion].subcategory_slug,
          onSuccess: response => {
            if (parseInt(response.data.level) <= parseInt(questions[currentQuestion].level)) {
              // set level data api
              leveldataApi({
                category_id: questions[currentQuestion].category,
                subcategory_id: questions[currentQuestion].subcategory,
                level: parseInt(questions[currentQuestion].level) + 1,
                onSuccess: response => { },
                onError: error => {
                  console.log(error)
                }
              })
            }
          },
          onError: error => {
            console.log(error)
          }
        })
      } else {
        UserCoinScoreApi({
          score: userScore,
          title: 'Quiz Zone Win',
          status: status,
          onSuccess: response => {
            updateUserDataInfo(response.data)
          },
          onError: error => {
            console.log(error)
          }
        })
      }
      
      dispatch(questionsDataSuceess(questions));
      let questionsLength
      if (skipQuestionClicked.current === true) {
        questionsLength = questions.length - 1
      }else{
        questionsLength = questions.length 
      }
      await onQuestionEnd(coins, userScore,questionsLength)


      braniaBadge()
      // dashing badge
      if (dashingdebut_status === '0') {
        setBadgesApi(
          'dashing_debut',
          (res) => {
            LoadNewBadgesData('dashing_debut', '1')
            toast.success(t(res?.data?.notification_body))
            const status = 0
            UserCoinScoreApi({
              coins: dashing_debut_coin,
              title: t('dashing_debut_reward'),
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

      const newObj = [...questions];

      newObj[currentQuestion].selected_answer = selected_option
      newObj[currentQuestion].isAnswered = true


   
      setQuestions(newObj)

      setTimeout(() => {
        setNextQuestion()
      }, 1000)
      dispatch(percentageSuccess(result_score))
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

  const handleBookmarkClick = (question_id, isBookmarked) => {
    let type = 1
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

  const handleFiftyFifty = () => {

    fiftyFiftyClicked.current = true

    let update_questions = [...questions,]
    if (update_questions[currentQuestion].question_type === '2') {
      toast.error(t('lifeline_not_allowed'))
      return false;
    }
    let all_option = ['optiona', 'optionb', 'optionc', 'optiond', 'optione']

    //Identify the correct answer option and add that to visible option array
    let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id)

    let index = all_option.indexOf('option' + decryptedAnswer)

    let visible_option = [all_option[index]]

    //delete correct option from all option array
    all_option.splice(index, 1)

    //Remove Options that are empty
    all_option.map((data, key) => {
      // console.log("admin",questions[currentQuestion][data])
      if (questions[currentQuestion][data] === '') {
        all_option.splice(key, 1)
      }
      return data
    })

    //Generate random key to select the second option from all option array
    let random_number = Math.floor(Math.random() * (all_option?.length - 1));
    // let random_number = Math.floor(Math.random() * all_option?.length)

    visible_option.push(all_option[random_number])

    //delete that option from all option array
    all_option.splice(random_number, 1)

    //at the end delete option from the current question that are available in all options
    all_option = all_option && all_option.map(data => {
      delete update_questions[currentQuestion][data]
      return data
    })

    update_questions[currentQuestion].fiftyUsed = true

    setQuestions(update_questions)
    // setUpdateQuestions(questions => [...questions, ...updatequestion]);
    return true
  }

  function generate(max, thecount) {
    let r = []
    let currsum = 0
    for (let i = 0; i < thecount - 1; i++) {
      r[i] = randombetween(1, max - (thecount - i - 1) - currsum)
      currsum += r[i]
    }
    r[thecount - 1] = max - currsum
    return r
  }

  function randombetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const handleAudiencePoll = () => {

    audiencePollClicked.current = true
    let update_questions = [...questions]
    let { answer, optione, question_type } = update_questions[currentQuestion]
    let decryptedAnswer = decryptAnswer(answer, userData?.data?.firebase_id)
    let all_option = []
    if (question_type === '2') {
      all_option = ['a', 'b']
    } else {
      all_option = ['a', 'b', 'c', 'd']
      if (questions[currentQuestion].optione) {
        if (optione !== "") {
          all_option.push("e");
        }
      }
    }

    //Generate Random % for all the options
    let numbers = generate(100, all_option?.length)

    //Get the Maximum number and assign that number to correct number
    let maximum = Math.max(...numbers)
    update_questions[currentQuestion]['probability_' + [decryptedAnswer]] = maximum + ' %'

    //Remove correct option and maximum number from the array
    all_option.splice(all_option.indexOf(decryptedAnswer), 1)
    numbers.splice(numbers.indexOf(maximum), 1)

    //apply map function and assign the remaining numbers to incorrect options
    all_option = all_option.map((data, key) => {
      update_questions[currentQuestion]['probability_' + [data]] = numbers[key] + ' %'
      return data
    })
    update_questions[currentQuestion].audeincePoll = true
    setQuestions(update_questions)
    // setUpdateQuestions(questions => [...questions, ...update_questions]);
  }

  const handleSkipQuestion = () => {
    skipQuestionClicked.current = true
    setCurrentQuestion(prevQuestion => prevQuestion - 1); // Decrement currentQuestion by 1

    // Check if there are negative indices and set it to 0 to prevent errors
    if (currentQuestion <= 0) {
      setCurrentQuestion(0);
    }
    setNextQuestion()
  }
  const onTimerExpire = () => {
    setNextQuestion()
    setInCorrAns(inCorrAns + 1)

  }

  const handleTimerReset = () => {
    timerResetClicked.current = true
    child.current.resetTimer()
  }

  function checkIfAnyLifelineClicked() {
    return (
      fiftyFiftyClicked.current ||
      audiencePollClicked.current ||
      timerResetClicked.current ||
      skipQuestionClicked.current
    )
  }

  // brainiac badge
  const braniaBadge = () => {
    let checkLineClickornot = checkIfAnyLifelineClicked()
    if (questions?.length < 5) {
      return
    }
    if (brainiac_status === '0' && checkLineClickornot == false) {
      setBadgesApi(
        'brainiac',
        (res) => {
          LoadNewBadgesData('brainiac', '1')
          toast.success(t(res?.data?.notification_body))
          const status = 0
          UserCoinScoreApi({
            coins: brainiac_coin,
            title: t('brainiac_reward'),
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
  }

  return (
    <React.Fragment>
      <div className='dashboardPlayUppDiv text-end p-2 pb-0 '>
        <QuestionTopSection corrAns={corrAns} inCorrAns={inCorrAns} currentQuestion={currentQuestion} questions={questions} showBookmark={showBookmark} handleBookmarkClick={handleBookmarkClick} showAnswers={true} />
      </div>
      <div className='questions' ref={scroll}>
        <div className="timerWrapper">

          {showQuestions ? (
            <div className='levelNumbr'>
              <h5 className='levelText'>
                {t('level')} : {questions[currentQuestion].level}
              </h5>
            </div>
          ) : (
            ''
          )}
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

        <QuestionMiddleSectionOptions questions={questions} currentQuestion={currentQuestion} setAnswerStatusClass={setAnswerStatusClass} handleAnswerOptionClick={handleAnswerOptionClick} probability={true} latex={true} />

        {showLifeLine ? (
          <>

            <div className='divider'>
              <hr style={{ width: '112%', backgroundColor: 'gray', height: '2px' }} />
            </div>

            <Lifelines
              handleFiftFifty={handleFiftyFifty}
              handleAudiencePoll={handleAudiencePoll}
              handleResetTime={handleTimerReset}
              handleSkipQuestion={handleSkipQuestion}
              currentquestions={questions[currentQuestion]}
              showFiftyFifty={questions[currentQuestion]['question_type'] == 2 ? false : true}
              audiencepoll={questions[currentQuestion]['question_type'] == 2 ? false : true}
              totalQuestions={questions.length}
            />
          </>
        ) : (
          ''
        )}
      </div>
    </React.Fragment>
  )
}

Question.propTypes = {
  questions: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func.isRequired
}

Question.defaultProps = {
  showLifeLine: true,
  showBookmark: true
}

export default withTranslation()(Question)
