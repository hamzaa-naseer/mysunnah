import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import Timer from "src/components/Common/Timer";
import { decryptAnswer, calculateScore, imgError, showAnswerStatusClass, audioPlay } from 'src/utils'
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
import { getFirestore, collection, doc, onSnapshot, getDocs, query, serverTimestamp, addDoc, updateDoc, deleteDoc, where, runTransaction, getDoc, documentId } from 'firebase/firestore';
import ShowMessagePopUp from 'src/components/messagePopUp/ShowMessagePopUpBtn';
import UserPopup from 'src/components/messagePopUp/userPopup';
import { Empty, Popover, Space } from 'antd';
import emoji from '../../messagePopUp/emoji_src'
import { Image } from 'react-bootstrap';

const MySwal = withReactContent(Swal)

const PlaywithFriendBattlequestions = ({ questions: data, timerSeconds, onOptionClick, onQuestionEnd }) => {
  const [questions, setQuestions] = useState(data)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [battleUserData, setBattleUserData] = useState([])
  // const [idForMsgPopUp, setIdForMsgPopUp] = useState()
  const [newMsgCreatedId, setNewMsgCreatedId] = useState()
  const [msgData, setMsgData] = useState()
  const [tMsg, setTMsg] = useState()
  const [isVisible, setIsVisible] = useState(false);
  const battleEmojiSeconsd = process.env.NEXT_PUBLIC_BATTLE_EMOJI_TEXT_MILI_SECONDS
  const [user1Id, setUser1Id] = useState()
  const [user2Id, setUser2Id] = useState()
  // console.log(user2Id);
  const Score = useRef(0)

  const dispatch = useDispatch()

  const navigate = useRouter()

  const user1timer = useRef(null)

  const user2timer = useRef(null)

  const scroll = useRef(null)

  const db = getFirestore();

  // store data get
  const idForMsgPopUp = useSelector(state => state.message)

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


  const user1 = useSelector(state => state.User)



  const addAnsweredQuestion = item => {
    setAnsweredQuestions({ ...answeredQuestions, [item]: true })
  }
  //firestore adding answer in doc
  let battleRoomDocumentId = groupBattledata.roomID

  // delete message id 

  const deleteMsgId = async () => {
    if (idForMsgPopUp.firestoreId !== null) {
      try {
        await deleteDoc(doc(db, 'messages', idForMsgPopUp.firestoreId));

      } catch (error) {
        toast.error(error.message || 'An error occurred');
      }
    }
  };


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
              onerror: error => {
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
              onerror: error => {
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
    const badgeEarnPoints = Number(systemconfig?.battle_mode_one_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_one_correct_answer_credit_score) * questions?.length
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
            onerror: error => {
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
  //recive id for individual popup show
  useEffect(() => {
    const showMsgToUser = async () => {

      if (idForMsgPopUp.firestoreId !== null) {
        const db = getFirestore();
        let documentRef = doc(db, 'messages', idForMsgPopUp.firestoreId);

        onSnapshot(documentRef,
          doc => {
            if (doc.exists && doc.data()) {
              let data = doc.data()
              setNewMsgCreatedId(data.by)
            }
          },
          error => {
            console.log('err', error)
          }
        )

      }
    }
    showMsgToUser()

  }, [idForMsgPopUp.firestoreId])



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

      userScore = await calculateScore(result_score, questions?.length, systemconfig?.battle_mode_one_correct_answer_credit_score, systemconfig?.battle_mode_one_wrong_answer_deduct_score)
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
  const submitAnswer = async (selectedOption) => {
    try {
      const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef);

      if (!docSnap.exists()) {
        return;
      }
      let battleroom = docSnap.data();

      let user1ans = battleroom.user1.answers;
      let user2ans = battleroom.user2.answers;

      if (userData?.data?.id === battleroom.user1.uid) {
        user1ans.push(selectedOption);
        await updateDoc(documentRef, {
          'user1.answers': user1ans
        });
      } else {
        user2ans.push(selectedOption);
        await updateDoc(documentRef, {
          'user2.answers': user2ans
        });
      }

      // Proceed with other operations after successful update
      answercheckSnapshot();
      checkpoints(selectedOption);
      checkCorrectAnswers(selectedOption);
    } catch (error) {
      console.error("Error submitting answer:", error);
      // Handle error appropriately, e.g., show a message to the user
    }
  };


  // point check
  const checkpoints = async option => {
    try {
      const documentRef = doc(db, 'battleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef);
      if (!docSnap.exists()) {
        return;
      }

      const battleroom = docSnap.data();

      const totalseconds = timerSeconds;
      const seconds = user1timer.current.getTimerSeconds();
      const finalScore = totalseconds - seconds;

      const user1name = battleroom.user1.name;
      const user2name = battleroom.user2.name;
      const user1point = battleroom.user1.points;
      const user2point = battleroom.user2.points;
      const user1uid = battleroom.user1.uid;
      const user2uid = battleroom.user2.uid;
      const user1image = battleroom.user1.profileUrl;
      const user2image = battleroom.user2.profileUrl;

      // Store data in local storage to get in result screen
      localStorageData(user1name, user2name, user1uid, user2uid, user1image, user2image);

      if (userData?.data?.id === battleroom.user1.uid) {
        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);
        if (decryptedAnswer === option) {
          // Point push logic remains the same
          let totalpush;
          if (finalScore < 2) {
            totalpush = Number(systemconfig?.battle_mode_one_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_one_correct_answer_credit_score);
          } else if (finalScore === 3 || finalScore === 4) {
            totalpush = Number(systemconfig?.battle_mode_one_second_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_one_correct_answer_credit_score);
          } else {
            totalpush = Number(systemconfig?.battle_mode_one_correct_answer_credit_score);
          }

          await updateDoc(documentRef, {
            [`user1.points`]: totalpush + user1point
          });
        }
      } else {
        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);
        if (decryptedAnswer === option) {
          // Similar logic for user2
          let totalpush;
          if (finalScore < 2) {
            totalpush = Number(systemconfig?.battle_mode_one_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_one_correct_answer_credit_score);
          } else if (finalScore === 3 || finalScore === 4) {
            totalpush = Number(systemconfig?.battle_mode_one_second_quickest_correct_answer_extra_score) + Number(systemconfig?.battle_mode_one_correct_answer_credit_score);
          } else {
            totalpush = Number(systemconfig?.battle_mode_one_correct_answer_credit_score);
          }

          await updateDoc(documentRef, {
            [`user2.points`]: totalpush + user2point
          });
        }
      }
    } catch (error) {
      console.error("Error processing checkpoints:", error);
    }
  };

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

      const battleroom = docSnap.data();

      let user1ans = battleroom.user1.answers;
      let user2ans = battleroom.user2.answers;

      if (userData?.data?.id === battleroom.user1.uid) {
        user1ans.push(-1); // Add -1 to user1's answers
        await updateDoc(documentRef, {
          ['user1.answers']: user1ans
        });
      } else {
        user2ans.push(-1); // Add -1 to user2's answers
        await updateDoc(documentRef, {
          ['user2.answers']: user2ans
        });
      }

      // Call answer check function
      answercheckSnapshot();
    } catch (error) {
      console.error("Error updating timer expire:", error);
    }
  };

  // answercheck snapshot
  const answercheckSnapshot = () => {
    let documentRef = doc(db, 'battleRoom', battleRoomDocumentId)

    onSnapshot(documentRef,
      doc => {
        if (doc.exists && doc.data()) {
          let battleroom = doc.data()

          let useroneAnswerLength = battleroom.user1.answers?.length

          let usertwoAnswerLength = battleroom.user2.answers?.length

          let entryFee = battleroom.entryFee

          if (useroneAnswerLength != 0 || usertwoAnswerLength != 0) {
            if (useroneAnswerLength === usertwoAnswerLength) {
              setTimeout(() => {
                setNextQuestion()
              }, 1000)
              if (user1timer.current !== null && user2timer.current !== null) {
                user1timer.current.resetTimer()
                user2timer.current.resetTimer()
              }
            } else if (useroneAnswerLength > usertwoAnswerLength) {
              if (userData?.data?.id === battleroom.user1.uid) {
                if (user1timer.current !== null) {
                  user1timer.current.pauseTimer()
                }
              } else {
                if (user2timer.current !== null) {
                  user2timer.current.pauseTimer()
                }
              }
            } else if (useroneAnswerLength < usertwoAnswerLength) {
              if (userData?.data?.id === battleroom.user2.uid) {
                if (user1timer.current !== null) {
                  user1timer.current.pauseTimer()
                }
              } else {
                if (user2timer.current !== null) {
                  user2timer.current.pauseTimer()
                }
              }
            }
          }
        }
      },
      error => {
        console.log('err', error)
      }
    )
  }

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

      let user1name = battleroom.user1.name

      let user2name = battleroom.user2.name

      let user1image = battleroom.user1.profileUrl

      let user2image = battleroom.user2.profileUrl

      let user1correct = battleroom.user1.correctAnswers

      let user2correct = battleroom.user2.correctAnswers

      let user1uid = battleroom.user1.uid

      let user2uid = battleroom.user2.uid

      // store data in local storage to get in result screen
      LoadGroupBattleData('user1name', user1name)
      LoadGroupBattleData('user2name', user2name)
      LoadGroupBattleData('user1image', user1image)
      LoadGroupBattleData('user2image', user2image)
      LoadGroupBattleData('user1uid', user1uid)
      LoadGroupBattleData('user2uid', user2uid)

      if (userData?.data?.id === battleroom.user1.uid) {
        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id)
        if (decryptedAnswer === option) {
          // correctanswer push
          await updateDoc(documentRef, {
            'user1.correctAnswers': user1correct + 1
          });
        }
      } else if (userData?.data?.id === battleroom.user2.uid) {
        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id)
        if (decryptedAnswer === option) {
          // correctanswer push
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
          setUser1Id(battleroom.user1.uid)
          let user2uid = battleroom.user2.uid
          setUser2Id(battleroom.user2.uid)

          let user1correctanswer = userone.correctAnswers

          LoadGroupBattleData('user1CorrectAnswer', user1correctanswer)

          let user2correctanswer = usertwo.correctAnswers

          LoadGroupBattleData('user2CorrectAnswer', user2correctanswer)

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
            })
          }

          const usersuid = [user1uid, user2uid]

          const newArray = newUser.filter(obj => Object.keys(obj.uid)?.length > 0)

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

          // checking if every user has given all question's answer
          navigateUserData.forEach(elem => {
            if (elem.uid != '') {
              // console.log("answer",elem.answers?.length, questions?.length)
              if (elem.answers?.length < questions?.length) {
                navigatetoresult = false
              }
            }
          })

          if (navigatetoresult) {
            // end screen
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
      let documentRef = doc(db, "battleRoom", battleRoomDocumentId)

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



  // message snapShote 

  useEffect(() => {
    if (groupBattledata.roomID) {
      const q = query(
        collection(db, 'messages'),
        where('roomId', '==', groupBattledata.roomID),
      );


      const unsubscribe = onSnapshot(q, snapshot => {

        snapshot.docChanges().forEach(change => {
          const data = change.doc.data();
          if (change.type === 'added') {
            const translatedMessage = t(data.message);
            setMsgData({ ...data, message: translatedMessage });
            setIsVisible(true);
            setTimeout(() => {
              setIsVisible(false);
              deleteMsgId()
            }, battleEmojiSeconsd);
          }
        }
        );
      });

      return () => unsubscribe();
    }
  }, []);



  const content = (
    <div>
      {msgData ? (
        msgData.isTextMessage ? (
          <div>{msgData.message}</div>
        ) : (
          msgData.message && (
            <div>
              <Image src={msgData.message} height="50px" width="50px" />
            </div>
          )
        )
      ) : (
        <div>No message data available</div>
      )}
    </div>
  );


  const loggedInUserData = battleUserData.find(item => item.uid === userData?.data?.id);


  const popUp = () => {
    if (battleUserData !== Empty) {
      return battleUserData.map((user, index) => {
        if (msgData !== undefined && (user1Id === msgData.by || user2Id === msgData.by)) {
          return (
            <Space wrap key={index} >
              <Popover
                content={content}
                overlayStyle={{ backgroundColor: '#f0f0f0' }}
                open={isVisible}
              >
              </Popover>
            </Space>
          );
        } else {
          return null;
        }
      });
    } else {
      return null;
    }
  };


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
        <div className='user_data onevsone below_1400'>
          <div className='user_one mb-4'>
            {/* timer */}
            <div className='inner__headerdash'>
              <div className='msgPopUpWrapperOneVsOne'>
                {msgData !== undefined && loggedInUserData?.uid == msgData.by && popUp()}
              </div>
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
          <ShowMessagePopUp></ShowMessagePopUp>
          <div className='user_two mb-4'>
            {/* timer */}
            <div className='inner__headerdash'>
              <div className='msgPopUpWrapperOneVsOne'>
                {msgData !== undefined && loggedInUserData?.uid !== msgData.by && popUp()}
              </div>
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
                <>                  <div className='inner_user_data'>
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

PlaywithFriendBattlequestions.propTypes = {
  questions: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func.isRequired
}

export default withTranslation()(PlaywithFriendBattlequestions)
