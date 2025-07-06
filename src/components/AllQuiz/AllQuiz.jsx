'use client'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { withTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { useSelector } from 'react-redux'
import { Loadbadgedata } from 'src/store/reducers/badgesSlice'
import { getuserbadgesApi, setBadgesApi } from 'src/store/actions/campaign'
import { websettingsData } from 'src/store/reducers/webSettings'
import { battleDataClear } from 'src/store/reducers/groupbattleSlice'
import { useRouter } from 'next/navigation'
import { t } from 'i18next'

import Breadcrumb from 'src/components/Common/Breadcrumb'

const AllQuiz = () => {
  const router = useRouter()

  const userData = useSelector(state => state.User)

  const systemconfig = useSelector(sysConfigdata)

  const websettingsdata = useSelector(websettingsData)

  // quiz feature image
  const quiz_zone_icon = websettingsdata && websettingsdata.quiz_zone_icon
  const daily_quiz_icon = websettingsdata && websettingsdata.daily_quiz_icon
  const true_false_icon = websettingsdata && websettingsdata.true_false_icon
  const fun_learn_icon = websettingsdata && websettingsdata.fun_learn_icon
  const self_challange_icon = websettingsdata && websettingsdata.self_challange_icon
  const contest_play_icon = websettingsdata && websettingsdata.contest_play_icon
  const one_one_battle_icon = websettingsdata && websettingsdata.one_one_battle_icon
  const group_battle_icon = websettingsdata && websettingsdata.group_battle_icon
  const audio_question_icon = websettingsdata && websettingsdata.audio_question_icon
  const math_mania_icon = websettingsdata && websettingsdata.math_mania_icon
  const exam_icon = websettingsdata && websettingsdata.exam_icon
  const guess_the_word_icon = websettingsdata && websettingsdata.guess_the_word_icon

  // data show
  const [data, setData] = useState([
    {
      id: 0,
      image: quiz_zone_icon,
      quizname: 'Quiz Zone',
      quizDesc: 'Select your favorite Zone to play',
      url: '/quiz-zone',
      quizzonehide: '1'
    },
    {
      id: 1,
      image: daily_quiz_icon,
      quizname: 'Daily Quiz',
      quizDesc: 'Daily basic new quiz game',
      url: '/quiz-play/daily-quiz-dashboard',
      dailyquizhide: '1'
    },
    {
      id: 2,
      image: true_false_icon,
      quizname: 'True & False',
      quizDesc: 'Choice your answers',
      url: '/quiz-play/true-and-false-play',
      truefalsehide: '1'
    },

    {
      id: 3,
      image: fun_learn_icon,
      quizname: 'Fun & Learn',
      quizDesc: "It's like a comprehension game",
      url: '/fun-and-learn',
      funandlearnhide: '1'
    },
    {
      id: 4,
      image: guess_the_word_icon,
      quizname: 'Guess The Word',
      quizDesc: 'Fun vocabulary game',
      url: '/guess-the-word',
      guessthewordhide: '1'
    },
    {
      id: 5,
      image: self_challange_icon,
      quizname: "Self Challenge",
      quizDesc: 'Challenge Yourself',
      url: '/self-learning',
      selfchallengehide: '1'
    },
    {
      id: 6,
      image: contest_play_icon,
      quizname: 'Contest Play',
      quizDesc: 'Play quiz contest',
      url: '/contest-play',
      contestplayhide: '1'
    },
    {
      id: 7,
      image: one_one_battle_icon,
      quizname: '1 v/s 1 Battle',
      quizDesc: 'Battle with one on one',
      url: '/random-battle',
      battlequizhide: '1'
    },
    {
      id: 8,
      image: group_battle_icon,
      quizname: 'Group Battle',
      quizDesc: `It's a group quiz battle`,
      url: '/group-battle',
      groupplayhide: '1'
    },
    {
      id: 9,
      image: audio_question_icon,
      quizname: 'Audio Questions',
      quizDesc: 'Select your favorite Zone to play',
      url: '/audio-questions',
      audioQuestionshide: '1'
    },
    {
      id: 10,
      image: math_mania_icon,
      quizname: 'Math Mania',
      quizDesc: 'Challenge Your Mind',
      url: '/math-mania',
      mathQuestionshide: '1'
    },
    {
      id: 11,
      image: exam_icon,
      quizname: 'Exam',
      quizDesc: 'Boost your knowledge',
      url: '/exam-module',
      examQuestionshide: '1'
    },
  ])


  // redirect to page
  const redirectdata = data => {
    const isAuthenticated = userData.token
    if (isAuthenticated === null) {
      router.push('/auth/login')
      toast.error('Please login first')
      return
    }
    if (!data.disabled) {
      router.push(data.url)
    }
  }

  // hide from system settings
  const checkDisabled = () => {
    const modes = [
      {
        configProperty: "quiz_zone_mode",
        dataProperty: "quizzonehide"
      },
      {
        configProperty: 'daily_quiz_mode',
        dataProperty: 'dailyquizhide'
      },
      {
        configProperty: 'contest_mode',
        dataProperty: 'contestplayhide'
      },
      {
        configProperty: 'true_false_mode',
        dataProperty: 'truefalsehide'
      },
      {
        configProperty: 'self_challenge_mode',
        dataProperty: 'selfchallengehide'
      },
      {
        configProperty: 'fun_n_learn_question',
        dataProperty: 'funandlearnhide'
      },
      {
        configProperty: 'guess_the_word_question',
        dataProperty: 'guessthewordhide'
      },
      // {
      //   configProperty: 'battle_mode_one',
      //   dataProperty: 'battlequizhide'
      // },
      {
        configProperty: 'battle_mode_group',
        dataProperty: 'groupplayhide'
      },
      {
        configProperty: 'audio_mode_question',
        dataProperty: 'audioQuestionshide'
      },
      {
        configProperty: 'maths_quiz_mode',
        dataProperty: 'mathQuestionshide'
      },
      {
        configProperty: 'exam_module',
        dataProperty: 'examQuestionshide'
      },
      {
        configProperty: 'battle_mode_random',
        dataProperty: 'battle_Random_Questionshide'
      }
    ]

    const newData = data.filter(item => {
      for (const mode of modes) {
        if (item[mode.dataProperty] === '1' && systemconfig[mode.configProperty] === '0') {
          return false
        }
      }
      return true
    })

    setData(newData)
  }

  useEffect(() => {
    checkDisabled()
    // badges api call and load
    if (userData?.data) {
      getuserbadgesApi({
        onSuccess: (res) => {
          let data = res.data
          Loadbadgedata(data)
          // streak badge which handling from backend
          setBadgesApi(
            'streak',
            () => { },
            error => {
              console.log(error)
            }
          )
        },
        onError: (err) => {
          console.log(err)
        }
      })
    }

  }, [userData])

  // this is only for guess the word based on english language only.
  // useEffect(() => {
  //   if (systemconfig?.guess_the_word_question === '1') {
  //     if (languages.code === 'en' || languages.code === 'en-GB') {
  //       // Check if the quiz already exists in the data array
  //       const quizExists = data.some(quiz => quiz.quizname === 'Guess The Word')

  //       // If the quiz doesn't exist, add it to the data array
  //       if (!quizExists) {
  //         setData(prevData => [
  //           ...prevData,
  //           {
  //             id: 4,
  //             image: guess_the_word_icon,
  //             quizname: 'Guess The Word',
  //             url: '/quiz-play/guess-the-word',
  //             guessthewordhide: '1'
  //           }
  //         ])
  //       }
  //     } else {
  //       // Remove "Guess The Word" quiz from the data array
  //       setData(prevData => prevData.filter(quiz => quiz.quizname !== 'Guess The Word'))
  //     }
  //   }
  // }, [languages.code])

  useEffect(() => {
    // disable battle if both one vs one and playwithfriend 
    if (systemconfig.battle_mode_random === "0" && systemconfig.battle_mode_one === "0") {
      setData(prevData => prevData.filter(quiz => quiz.quizname !== '1 v/s 1 Battle'))
    }
  }, [systemconfig])

  useEffect(() => {
    // clear local storage poins
    battleDataClear()
  }, [])

  return (
    <>
      {/* <Meta /> */}
      <Breadcrumb showBreadcrumb={true} title={`${t('quiz')} ${t('play')}`} content={t('home')} contentTwo={`${t('quiz')} ${t('play')}`} />
      <div className='Quizzone my-5'>
        <div className='container'>
          {data?.length === 0 ? (
            <p className="text-center">{t("noquiz")} </p>
          ) : (
            <ul className='row justify-content-center'>
              {data.map(quiz => (
                <li
                  onClick={() => redirectdata(quiz)}
                  className='col-xl-3 col-lg-3 col-md-4 col-sm-6 col-6 small__div'
                  key={quiz.id}
                >
                  <div className='inner__Quizzone'>
                    {quiz.disabled ? (
                      <div className='card_disabled'>
                        <div className='card__icon'>
                          <img src={quiz.image} alt='icon' />
                        </div>
                        <div className='title__card'>
                          <h5 className='inner__title gameTitle'>{t(quiz.quizname)}</h5>
                          <span className='inner__desc gameDesc'>{t(quiz.quizDesc)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className='card'>
                        <div className='card__icon'>
                          <img src={quiz.image} alt='icon' />
                        </div>
                        <div className='title__card'>
                          <h5 className='inner__title gameTitle'>{t(quiz.quizname)}</h5>
                          <span className='inner__desc gameDesc'>{t(quiz.quizDesc)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )
          }
        </div>
      </div>

      {/* <LearningFun img={bookImg} learingFunData={learingFunData} />

      <FAQS faqsData={faqsData} /> */}

    </>
  )
}
export default withTranslation()(AllQuiz)
