import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import Timer from "src/components/Common/Timer";
import { decryptAnswer, calculateScore, imgError, showAnswerStatusClass, audioPlay, messageList } from 'src/utils'
import { useDispatch, useSelector } from 'react-redux'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { getusercoinsApi, setBadgesApi, UserCoinScoreApi, UserStatisticsApi } from 'src/store/actions/campaign'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { groupbattledata, LoadGroupBattleData } from 'src/store/reducers/groupbattleSlice'
import toast from 'react-hot-toast'
import { badgesData, LoadNewBadgesData } from 'src/store/reducers/badgesSlice'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useRouter } from 'next/router'
import rightTickIcon from 'src/assets/images/check-circle-score-screen.svg'
import { percentageSuccess, questionsDataSuceess } from 'src/store/reducers/tempDataSlice';
import { t } from 'i18next';
import QuestionTopSection from 'src/components/view/common/QuestionTopSection';
import QuestionMiddleSectionOptions from 'src/components/view/common/QuestionMiddleSectionOptions';
import { getFirestore, collection, doc, onSnapshot, getDocs, query, serverTimestamp, addDoc, updateDoc, deleteDoc, where, runTransaction, getDoc } from 'firebase/firestore';

const MySwal = withReactContent(Swal)

const RandomQuestions = ({ questions: data, timerSeconds, onOptionClick, onQuestionEnd, showBookmark }) => {
  const [questions, setQuestions] = useState(data)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [playwithrobot, setPlaywithrobot] = useState(false)

  const [battleUserData, setBattleUserData] = useState([])

  const dispatch = useDispatch()

  const navigate = useRouter()

  const Score = useRef(0)

  const user1timer = useRef(null)

  const user2timer = useRef(null)

  const scroll = useRef(null)

  const db = getFirestore();

  // store data get
  const userData = useSelector(state => state.User)

  const systemconfig = useSelector(sysConfigdata)

  const groupBattledata = useSelector(groupbattledata)

  const Badges = useSelector(badgesData)

  const combat_winnerBadge = Badges?.data?.find(badge => badge?.type === 'combat_winner');

  const ultimate_playerBadge = Badges?.data?.find(badge => badge?.type === 'ultimate_player');

  const combat_winner_status = combat_winnerBadge && combat_winnerBadge?.status

  const combat_winner_coin = combat_winnerBadge && combat_winnerBadge?.badge_reward

  const ultimate_status = ultimate_playerBadge && ultimate_playerBadge?.status

  const ultimate_player_coin = ultimate_playerBadge && ultimate_playerBadge?.badge_reward

  const [answeredQuestions, setAnsweredQuestions] = useState({})

  const addAnsweredQuestion = item => {
    setAnsweredQuestions({ ...answeredQuestions, [item]: true })
  }
  useEffect(() => {

  }, [questions])
  //firestore adding answer in doc
  let battleRoomDocumentId = groupBattledata.roomID

  // delete battle room
  const deleteBattleRoom = async documentId => {
    try {
      await deleteDoc(doc(db, "battleRoom", documentId));
    } catch (error) {
      toast.error(error);
    }
  };


  // combat winner
  const combatWinner = () => {
    if (combat_winner_status === '0') {
      // console.log("hello",user1uid,userData?.data?.id, user1point, user2point)
      if (groupBattledata.user1uid === userData?.data?.id && groupBattledata.user1point > groupBattledata.user2point) {
        setBadgesApi(
          'combat_winner',
          (res) => {
            LoadNewBadgesData('combat_winner', '1')
            toast.success(t(res?.data?.notification_body))
            const status = 0
            UserCoinScoreApi({
              coins: combat_winner_coin,
              title: t('combat_badge_reward'),
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
      } else if (
        userData?.data?.id === groupBattledata.user2uid &&
        groupBattledata.user1point < groupBattledata.user2point
      ) {
        setBadgesApi(
          'combat_winner',
          (res) => {
            LoadNewBadgesData('combat_winner', '1')
            toast.success(t(res?.data?.notification_body))
            const status = 0
            UserCoinScoreApi({
              coins: combat_winner_coin,
              title: t('combat_badge_reward'),
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

  //if user's points is same as highest points
  const ultimatePlayer = () => {
    const badgeEarnPoints = (Number(systemconfig?.battle_mode_random_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_random_correct_answer_credit_score)) * questions?.length
    const currentUserPoint =
      groupBattledata.user1uid === userData?.data?.id ? groupBattledata.user1point : groupBattledata.user2point
    if (currentUserPoint === badgeEarnPoints && ultimate_status === '0') {
      setBadgesApi(
        'ultimate_player',
        (res) => {
          LoadNewBadgesData('ultimate_player', '1')
          toast.success(t(res?.data?.notification_body))
          const status = 0
          UserCoinScoreApi({
            coins: ultimate_player_coin,
            title: t('ultimate_badge_reward'),
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

  // next questions
  const setNextQuestion = async () => {
    const nextQuestion = currentQuestion + 1

    if (nextQuestion < questions?.length) {
      setCurrentQuestion(nextQuestion)
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

      userScore = await calculateScore(result_score, questions?.length, systemconfig?.battle_mode_random_correct_answer_credit_score, systemconfig?.battle_mode_random_wrong_answer_deduct_score)
      await onQuestionEnd(coins, userScore)
      combatWinner()
      ultimatePlayer()
      deleteBattleRoom(battleRoomDocumentId)
    }
  }

  // button option answer check
  const handleAnswerOptionClick = async selected_option => {


    if (!answeredQuestions.hasOwnProperty(currentQuestion)) {
      addAnsweredQuestion(currentQuestion)

      let { id, answer } = questions[currentQuestion]

      let decryptedAnswer = decryptAnswer(answer, userData?.data?.firebase_id)

      let result_score = Score.current

      if (decryptedAnswer === selected_option) {
        result_score++
        Score.current = result_score
      }

      // this for only audio
      const currentIndex = currentQuestion;

      const currentQuestionq = questions[currentIndex];

      audioPlay(selected_option, currentQuestionq.answer)

      let update_questions = questions.map(data => {
        return data.id === id ? { ...data, selected_answer: selected_option, isAnswered: true } : data
      })

      setQuestions(update_questions)

      submitAnswer(selected_option)

      dispatch(percentageSuccess(result_score))

      onOptionClick(update_questions, result_score)

      dispatch(questionsDataSuceess(update_questions));
    }
  }

  // auto robot submit answer
  const autoRobotClick = async () => {
    let { id, answer, question_type } = questions[currentQuestion]

    let options = []

    if (question_type === '1') {
      options.push('a', 'b', 'c', 'd')
    } else if (question_type === '2') {
      options.push('a', 'b')
    } else if (questions[currentQuestion].optione !== "") {
      options.push('a', 'b', 'c', 'd', 'e')
    }

    const randomIdx = Math.floor(Math.random() * options?.length)
    const submittedAnswer = options[randomIdx]
    robotsubmitAnswer(submittedAnswer)
  }

  // robot submitAnser
  const robotsubmitAnswer = async selected_option => {
    try {
      const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef);

      if (!docSnap.exists()) {
        console.log("No such document!");
        return;
      }

      let battleroom = docSnap.data();

      let user2ans = battleroom.user2.answers;

      // Push the selected option to the answers array
      user2ans.push(selected_option);

      // Update the document with the new answers array
      await updateDoc(documentRef, {
        'user2.answers': user2ans
      });

      // Call other functions after successfully updating the document
      answercheckSnapshot();
      checkRobotpoints(selected_option);
      checkRobotCorrectAnswers(selected_option);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  }

  // point check
  const checkRobotCorrectAnswers = async option => {
    try {
      const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef);

      if (!docSnap.exists()) {
        console.log("No such document!");
        return;
      }

      let battleroom = docSnap.data();

      let user2name = battleroom.user2.name;
      let user2image = battleroom.user2.profileUrl;
      let user2correct = battleroom.user2.correctAnswers;
      let user2uid = battleroom.user2.uid;

      // Store data in local storage to get in result screen
      LoadGroupBattleData('user2name', user2name);
      LoadGroupBattleData('user2image', user2image);
      LoadGroupBattleData('user2uid', user2uid);

      let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);
      if (decryptedAnswer === option) {
        // Correct answer push
        await updateDoc(documentRef, {
          'user2.correctAnswers': user2correct + 1
        });
      }
    } catch (error) {
      console.error("Error checking robot correct answers:", error);
    }
  }


  // storing dataa of points in localstorage
  const localStorageData = (user1name, user2name, user1uid, user2uid, user1image, user2image) => {
    LoadGroupBattleData('user1name', user1name)
    LoadGroupBattleData('user2name', user2name)
    LoadGroupBattleData('user1image', user1image)
    LoadGroupBattleData('user2image', user2image)
    LoadGroupBattleData('user1uid', user1uid)
    LoadGroupBattleData('user2uid', user2uid)
  }

  const localStoragePoint = (user1point, user2point) => {
    LoadGroupBattleData('user1point', user1point)
    LoadGroupBattleData('user2point', user2point)
  }

  // submit answer
  const submitAnswer = async selected_option => {
    try {
      const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef);

      if (!docSnap.exists()) {
        console.log("No such document!");
        return;
      }

      let battleroom = docSnap.data();

      let user1ans = battleroom.user1.answers;
      let user2ans = battleroom.user2.answers;

      // Answer update in document
      if (userData?.data?.id === battleroom.user1.uid) {
        // Answer push
        user1ans.push(selected_option);

        await updateDoc(documentRef, {
          'user1.answers': user1ans
        });
        if (playwithrobot) {
          autoRobotClick();
        }
      } else {
        // Answer push
        user2ans.push(selected_option);

        await updateDoc(documentRef, {
          'user2.answers': user2ans
        });
      }

      // Answer check
      answercheckSnapshot();

      // Points
      checkpoints(selected_option);

      // Check correct answer
      checkCorrectAnswers(selected_option);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  }


  // point check
  const checkRobotpoints = async option => {
    try {
      const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef);

      if (!docSnap.exists()) {
        console.log("No such document!");
        return;
      }

      let battleroom = docSnap.data();

      let totalseconds = timerSeconds;
      let seconds = user1timer.current.getTimerSeconds();
      let finalScore = totalseconds - seconds;

      let user2name = battleroom.user2.name;
      let user2point = battleroom.user2.points;
      let user2uid = battleroom.user2.uid;
      let user2image = battleroom.user2.profileUrl;

      LoadGroupBattleData('user2name', user2name);
      LoadGroupBattleData('user2image', user2image);
      LoadGroupBattleData('user2uid', user2uid);
      LoadGroupBattleData('user2point', user2point);

      let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);

      if (decryptedAnswer === option) {
        // Point push
        let totalpush;
        if (finalScore < 2) {
          totalpush = Number(systemconfig?.battle_mode_random_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_random_correct_answer_credit_score);
        } else if (finalScore === 3 || finalScore === 4) {
          totalpush = Number(systemconfig?.battle_mode_random_second_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_random_correct_answer_credit_score);
        } else {
          totalpush = Number(systemconfig?.battle_mode_random_correct_answer_credit_score);
        }

        await updateDoc(documentRef, {
          'user2.points': totalpush + user2point
        });
      }
    } catch (error) {
      console.error("Error checking robot points:", error);
    }
  }


  // point check

  const checkpoints = async option => {
    try {
      const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef);

      if (!docSnap.exists()) {
        console.log("No such document!");
        return;
      }

      let battleroom = docSnap.data();

      let totalseconds = timerSeconds;
      let seconds = 0;

      if (user1timer.current !== null) {
        seconds = user1timer.current.getTimerSeconds();
      }

      let finalScore = totalseconds - seconds;

      let user1name = battleroom.user1.name;
      let user2name = battleroom.user2.name;
      let user1point = battleroom.user1.points;
      let user2point = battleroom.user2.points;
      let user1uid = battleroom.user1.uid;
      let user2uid = battleroom.user2.uid;
      let user1image = battleroom.user1.profileUrl;
      let user2image = battleroom.user2.profileUrl;

      // Store data in local storage to get in result screen
      localStorageData(user1name, user2name, user1uid, user2uid, user1image, user2image);

      let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);
      if (decryptedAnswer === option) {
        // Point push logic remains the same
        let totalpush;
        if (finalScore < 2) {
          totalpush = Number(systemconfig?.battle_mode_random_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_random_correct_answer_credit_score);
        } else if (finalScore === 3 || finalScore === 4) {
          totalpush = Number(systemconfig?.battle_mode_random_second_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_random_correct_answer_credit_score);
        } else {
          totalpush = Number(systemconfig?.battle_mode_random_correct_answer_credit_score);
        }

        if (userData?.data?.id === battleroom.user1.uid) {
          await updateDoc(documentRef, {
            'user1.points': totalpush + user1point
          });
        } else {
          await updateDoc(documentRef, {
            'user2.points': totalpush + user2point
          });
        }
      }
    } catch (error) {
      console.error("Error checking checkpoints:", error);
    }
  }


  // option answer status check
  const setAnswerStatusClass = option => {
    const currentIndex = currentQuestion;
    const currentQuestionq = questions[currentIndex];
    const color = showAnswerStatusClass(option, currentQuestionq.isAnswered, currentQuestionq.answer, currentQuestionq.selected_answer)
    return color
  }

  // on timer expire
  const onTimerExpire = async () => {
    try {
      const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef);

      if (!docSnap.exists()) {
        console.log("No such document!");
        return;
      }

      let battleroom = docSnap.data();

      let user1ans = battleroom.user1.answers;
      let user2ans = battleroom.user2.answers;
      let playwithRobot = battleroom.playwithRobot;

      if (userData?.data?.id === battleroom.user1.uid) {
        user1ans.push(-1);

        await updateDoc(documentRef, {
          'user1.answers': user1ans
        });
      } else {
        user2ans.push(-1);
        await updateDoc(documentRef, {
          'user2.answers': user2ans
        });
      }

      // On time expire submit answer
      if (playwithRobot) {
        autoRobotClick();
      }

      // Answer check
      answercheckSnapshot();
    } catch (error) {
      console.error("Error on timer expire:", error);
    }
  }


  // answercheck snapshot
  const answercheckSnapshot = () => {
    const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

    onSnapshot(documentRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        let battleroom = docSnapshot.data();

        let userOneAnswerLength = battleroom.user1.answers?.length;
        let userTwoAnswerLength = battleroom.user2.answers?.length;
        let entryFee = battleroom.entryFee;

        if (userOneAnswerLength !== 0 || userTwoAnswerLength !== 0) {
          if (userOneAnswerLength === userTwoAnswerLength) {
            setTimeout(() => {
              setNextQuestion();
            }, 1000);
            if (user1timer.current !== null && user2timer.current !== null) {
              user1timer.current.resetTimer();
              user2timer.current.resetTimer();
            }
          } else if (userOneAnswerLength > userTwoAnswerLength) {
            if (userData?.data?.id === battleroom.user1.uid) {
              if (user1timer.current !== null) {
                user1timer.current.pauseTimer();
              }
            } else {
              if (user2timer.current !== null) {
                user2timer.current.pauseTimer();
              }
            }
          } else if (userOneAnswerLength < userTwoAnswerLength) {
            if (userData?.data?.id === battleroom.user2.uid) {
              if (user1timer.current !== null) {
                user1timer.current.pauseTimer();
              }
            } else {
              if (user2timer.current !== null) {
                user2timer.current.pauseTimer();
              }
            }
          }
        }
      }
    }, (error) => {
      console.error('Error listening for snapshot:', error);
    });
  };


  // point check
  const checkCorrectAnswers = async option => {
    try {
      const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef);

      if (!docSnap.exists()) {
        console.log("No such document!");
        return;
      }

      let battleroom = docSnap.data();

      let user1name = battleroom.user1.name;
      let user2name = battleroom.user2.name;
      let user1image = battleroom.user1.profileUrl;
      let user2image = battleroom.user2.profileUrl;
      let user1correct = battleroom.user1.correctAnswers;
      let user2correct = battleroom.user2.correctAnswers;
      let user1uid = battleroom.user1.uid;
      let user2uid = battleroom.user2.uid;

      // Store data in local storage to get in result screen
      LoadGroupBattleData('user1name', user1name);
      LoadGroupBattleData('user2name', user2name);
      LoadGroupBattleData('user1image', user1image);
      LoadGroupBattleData('user2image', user2image);
      LoadGroupBattleData('user1uid', user1uid);
      LoadGroupBattleData('user2uid', user2uid);

      let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);
      if (decryptedAnswer === option) {
        // Correct answer push
        if (userData?.data?.id === battleroom.user1.uid) {
          await updateDoc(documentRef, {
            'user1.correctAnswers': user1correct + 1
          });
        } else if (userData?.data?.id === battleroom.user2.uid) {
          await updateDoc(documentRef, {
            'user2.correctAnswers': user2correct + 1
          });
        }
      }
    } catch (error) {
      console.error("Error checking correct answers:", error);
    }
  }

  //answerlength check
  const SnapshotData = () => {
    let documentRef = doc(db, "battleRoom", battleRoomDocumentId)
    let executed = false
    let TotalUserLength = false

    onSnapshot(documentRef,
      doc => {
        let navigatetoresult = true

        if (doc.exists && doc.data()) {
          let battleroom = doc.data()

          let user1point = battleroom.user1.points

          let entryFee = battleroom.entryFee

          LoadGroupBattleData('entryFee', entryFee)

          let user2point = battleroom.user2.points

          let userone = battleroom.user1

          let usertwo = battleroom.user2

          let user1uid = battleroom.user1.uid

          let user2uid = battleroom.user2.uid

          let user1correctanswer = userone.correctAnswers

          let playwithrobot = battleroom?.playwithRobot

          LoadGroupBattleData('user1CorrectAnswer', user1correctanswer)

          let user2correctanswer = usertwo.correctAnswers

          LoadGroupBattleData('user2CorrectAnswer', user2correctanswer)

          // this only for robot
          if (playwithrobot) {
            setPlaywithrobot(true)
          }

          // point update in localstorage
          localStoragePoint(user1point, user2point)

          let navigateUserData = []

          navigateUserData = [userone, usertwo]

          setBattleUserData([userone, usertwo])

          // if user length is less than 1
          const newUser = [userone, usertwo]

          const usersWithNonEmptyUid = newUser.filter(elem => elem.uid !== '')

          if (!TotalUserLength) {
            TotalUserLength = true
            LoadGroupBattleData('totalusers', usersWithNonEmptyUid?.length)
          }

          // here check if user enter the game coin deduct its first time check
          if (!executed) {
            executed = true
            newUser.forEach(obj => {
              if (userData?.data?.id === obj.uid && obj.uid !== '' && battleroom.entryFee > 0) {
                const status = 1
                // when play with robot coin not deducte if user id === 000
                if (user2uid !== "000") {
                  UserCoinScoreApi({
                    coins: '-' + battleroom.entryFee,
                    title: t('played_battle'),
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
              }
            })
          }

          const usersuid = [user1uid, user2uid]

          const newArray = newUser.filter(obj => Object.keys(obj.uid)?.length > 0)

          // console.log("newarray",newArray,newArray?.length,usersuid.includes(userData?.data?.id))

          if (usersuid.includes(userData?.data?.id) && newArray?.length < 2) {
            MySwal.fire({
              title: t('opponent_left'),
              icon: 'warning',
              showCancelButton: false,
              customClass: {
                confirmButton: 'Swal-confirm-buttons',
                cancelButton: "Swal-cancel-buttons"
              },
              confirmButtonText: t('ok')
            }).then(result => {
              if (result.isConfirmed) {
                navigate.push('/quiz-play')
                deleteBattleRoom(battleRoomDocumentId)
              }
            })
          }

          //checking if every user has given all question's answer
          navigateUserData.forEach(elem => {
            if (elem.uid != '') {
              // console.log("answer",elem.answers?.length, questions?.length)
              if (elem.answers?.length < questions?.length) {
                navigatetoresult = false
              }
            }
          })

          if (navigatetoresult) {
            setTimeout(async () => {
              await onQuestionEnd();
              deleteBattleRoom(battleRoomDocumentId);
            }, 1000);
          }
        } else {
          if (navigatetoresult && questions?.length < currentQuestion) {
            navigate.push('/')
          } else {
            onQuestionEnd()
          }
        }
      },
      error => {
        console.log('err', error)
      }
    )
  }

  useEffect(() => {
    checkCorrectAnswers()
  }, [])

  useEffect(() => {
    SnapshotData()
    answercheckSnapshot()
    checkpoints()

    return () => {
      let documentRef = doc(db, "battleRoom", battleRoomDocumentId);

      onSnapshot(documentRef,
        doc => {
          if (doc.exists && doc.data()) {
            let battleroom = doc.data()

            let user1uid = battleroom && battleroom.user1.uid

            let user2uid = battleroom && battleroom.user2.uid

            let roomid = doc.id

            if (user1uid === userData?.data?.id) {
              updateDoc(documentRef, {
                'user1.name': '',
                'user1.uid': '',
                'user1.profileUrl': ''
              });
            } else if (user2uid === userData?.data?.id) {
              updateDoc(documentRef, {
                'user2.name': '',
                'user2.uid': '',
                'user2.profileUrl': ''
              });
            }

            navigate.push('/quiz-play')
            deleteBattleRoom(roomid)
          }
        },
        error => {
          console.log('err', error)
        }
      )
    }
  }, [])


  // const addMessage = async (message, by, roomId, isTextMessage ) => {
  //   try {
  //     let documentreference = await addDoc(collection(db, 'messages'), {
  //       by: by,
  //       isTextMessage: isTextMessage,
  //       message: message,
  //       messageId: '',
  //       roomId: roomId,
  //       timestamp: Date.now()
  //     })

  //     return await documentreference
  //   } catch (error) {
  //     toast.error(error)
  //   }
  // }

  // const getUserLatestMessage = (userId, messageId) => {
  //   if (messageList.messageListData.length > 0) {
  //     const messagesByUser = messageList.messageListData.filter((element) => element.by === userId);

  //     if (messagesByUser.length === 0) {
  //       return { by: '', isTextMessage: false, message: '', messageId: '', roomId: '', timestamp: null };
  //     }

  //     if (messageId === null) {
  //       return messagesByUser[0];
  //     }

  //     return messagesByUser[0].messageId === messageId
  //       ? { by: '', isTextMessage: false, message: '', messageId: '', roomId: '', timestamp: null }
  //       : messagesByUser[0];
  //   }
  //   return { by: '', isTextMessage: false, message: '', messageId: '', roomId: '', timestamp: null };
  // };


  const loggedInUserData = battleUserData.find(item => item.uid === userData?.data?.id);


  return (
    <React.Fragment>
      <div className='dashboardPlayUppDiv funLearnQuestionsUpperDiv selfLearnQuestionsUpperDiv text-end p-2 pb-0 '>
        <QuestionTopSection currentQuestion={currentQuestion} questions={questions} showAnswers={false} />
      </div>
      <div className='questions battlequestion' ref={scroll}>
        <QuestionMiddleSectionOptions questions={questions} currentQuestion={currentQuestion} setAnswerStatusClass={setAnswerStatusClass} handleAnswerOptionClick={handleAnswerOptionClick} probability={false} latex={true} />

        <div className='divider'>
          <hr style={{ width: '112%', backgroundColor: 'gray', height: '2px' }} />
        </div>

        {/* user1 */}
        <div className='user_data onevsone'>
          <div className='user_one mb-4'>
            {/* timer */}
            <div className='inner__headerdash'>
              {questions && questions[0]['id'] !== '' ? (
                <Timer ref={user1timer} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} />
              ) : (
                ''
              )}
            </div>
            {/* userinfo */}
            <div className='inner_user_data onevsonedetails'>
              <div className='username'>
                <p>{loggedInUserData?.name ? loggedInUserData?.name : "Waiting..."}</p>
              </div>
              <div className='userpoints'>
                <div className="rightWrongAnsDiv">
                  <span className='rightAns'>
                    <img src={rightTickIcon.src} alt="" />
                    {loggedInUserData?.correctAnswers ? loggedInUserData?.correctAnswers : 0} / <span>{questions?.length}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='user_two mb-4'>
            {/* timer */}
            <div className='inner__headerdash'>
              {questions && questions[0]['id'] !== '' ? (
                <Timer ref={user2timer} timerSeconds={timerSeconds} onTimerExpire={() => { }} />
              ) : (
                ''
              )}
            </div>
            {/* userinfo */}
            {battleUserData?.map(data => (
              data.uid !== userData?.data?.id &&
                data.uid !== '' ? (
                <>
                  <div className='inner_user_data'>
                    <div className='username'>
                      <p>{data.name ? data.name : 'Waiting...'}</p>
                    </div>
                    <div className='userpoints'>
                      <div className="rightWrongAnsDiv">
                        <span className='rightAns'>
                          <img src={rightTickIcon.src} alt="" />
                          {data.correctAnswers ? data.correctAnswers : 0} / <span>{questions?.length}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

RandomQuestions.propTypes = {
  questions: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func.isRequired
}

export default withTranslation()(RandomQuestions)
