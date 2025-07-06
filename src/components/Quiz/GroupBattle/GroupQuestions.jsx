"use client"
import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import Timer from "src/components/Common/Timer";
import { audioPlay, decryptAnswer, imgError, showAnswerStatusClass } from 'src/utils'
import toast from 'react-hot-toast'
import { Empty, Popover, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import { getusercoinsApi, setBadgesApi, UserCoinScoreApi, UserStatisticsApi } from 'src/store/actions/campaign'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { groupbattledata, LoadGroupBattleData } from 'src/store/reducers/groupbattleSlice'
import { badgesData, LoadNewBadgesData } from 'src/store/reducers/badgesSlice'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useRouter } from 'next/navigation'
import { percentageSuccess, questionsDataSuceess } from 'src/store/reducers/tempDataSlice';
import QuestionMiddleSectionOptions from 'src/components/view/common/QuestionMiddleSectionOptions';
import { getFirestore, collection, doc, onSnapshot, getDocs, query, serverTimestamp, addDoc, updateDoc, deleteDoc, where, runTransaction, getDoc } from 'firebase/firestore';
import QuestionTopSection from 'src/components/view/common/QuestionTopSection';
import ShowMessagePopUp from 'src/components/messagePopUp/ShowMessagePopUpBtn';
import { Modal } from 'react-bootstrap';
import Image from 'next/image';


const MySwal = withReactContent(Swal)
const battleEmojiSeconsd = process.env.NEXT_PUBLIC_BATTLE_EMOJI_TEXT_MILI_SECONDS

const GroupQuestions = ({ t, questions: data, timerSeconds, onOptionClick, onQuestionEnd, showBookmark }) => {
  const [questions, setQuestions] = useState(data)

  const [currentQuestion, setCurrentQuestion] = useState(0)

  const dispatch = useDispatch()

  const db = getFirestore();

  const [waitforothers, setWaitforOthers] = useState(false)

  const [battleUserData, setBattleUserData] = useState([])

  const child = useRef(null)

  const scroll = useRef(null)

  const Score = useRef(0)

  const navigate = useRouter()

  // store data get
  const userData = useSelector(state => state.User)

  const idForMsgPopUp = useSelector(state => state.message)


  const groupBattledata = useSelector(groupbattledata)

  const Badges = useSelector(badgesData)

  const clash_winnerBadge = Badges?.data?.find(badge => badge?.type === 'clash_winner');

  const clash_winner_status = clash_winnerBadge && clash_winnerBadge?.status

  const clash_winner_coin = clash_winnerBadge && clash_winnerBadge?.badge_reward

  let playerremove = useRef(false)

  const [answeredQuestions, setAnsweredQuestions] = useState({})

  const [msgData, setMsgData] = useState()
  const [isVisible, setIsVisible] = useState(false)

  const addAnsweredQuestion = item => {
    setAnsweredQuestions({ ...answeredQuestions, [item]: true })
  }

  setTimeout(() => {
    setQuestions(data)
  }, 500)

  //firestore adding answer in doc
  let battleRoomDocumentId = groupBattledata.roomID

  // delete battle room
  const deleteBattleRoom = async documentId => {
    try {
      await deleteDoc(doc(db, "multiUserBattleRoom", documentId));
    } catch (error) {
      toast.error(error);
    }
  };


  // clash winner badge
  const groupAllBattledata = [
    { uid: groupBattledata.user1uid, point: groupBattledata.user1point },
    { uid: groupBattledata.user2uid, point: groupBattledata.user2point },
    { uid: groupBattledata.user3uid, point: groupBattledata.user3point },
    { uid: groupBattledata.user4uid, point: groupBattledata.user4point }
    // add more objects for additional users
  ]
  // console.log('groupAllBattledata', groupAllBattledata)
  const clashWinnerBadge = () => {
    if (clash_winner_status === '0') {
      for (let i = 0; i < groupAllBattledata?.length; i++) {
        const user = groupAllBattledata[i] // get current user object
        if (userData?.data?.id === user.uid) {
          // check if current user object matches current user
          let hasHighestScore = true // assume current user has highest score
          for (let j = 0; j < groupAllBattledata?.length; j++) {
            // loop over all users except current user
            if (i !== j) {
              // skip current user
              if (user.point <= groupAllBattledata[j].point) {
                // check if current user's score is less than or equal to other user's score
                hasHighestScore = false // if not, set hasHighestScore to false
                break // exit inner loop since current user does not have highest score
              }
            }
          }
          if (hasHighestScore) {
            // if current user has highest score, set badge
            setBadgesApi(
              'clash_winner',
              (res) => {
                LoadNewBadgesData('clash_winner', '1')
                toast.success(t(res?.data?.notification_body))
                const status = 0
                UserCoinScoreApi({
                  coins: clash_winner_coin,
                  title: t('clash_badge_reward'),
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
          break // exit outer loop since current user object has been found
        }
      }
    }
  }

  // next questions
  const setNextQuestion = () => {
    const nextQuestion = currentQuestion + 1

    if (nextQuestion < questions?.length) {
      setCurrentQuestion(nextQuestion)
      child.current.resetTimer()
    } else {
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
  const localStorageData = (
    user1name,
    user2name,
    user3name,
    user4name,
    user1image,
    user2image,
    user3image,
    user4image,
    user1uid,
    user2uid,
    user3uid,
    user4uid
  ) => {
    LoadGroupBattleData('user1name', user1name)
    LoadGroupBattleData('user2name', user2name)
    LoadGroupBattleData('user3name', user3name)
    LoadGroupBattleData('user4name', user4name)
    LoadGroupBattleData('user1image', user1image)
    LoadGroupBattleData('user2image', user2image)
    LoadGroupBattleData('user3image', user3image)
    LoadGroupBattleData('user4image', user4image)
    LoadGroupBattleData('user1uid', user1uid)
    LoadGroupBattleData('user2uid', user2uid)
    LoadGroupBattleData('user3uid', user3uid)
    LoadGroupBattleData('user4uid', user4uid)
  }

  // submit answer
  const submitAnswer = async selected_option => {
    try {
      const documentRef = doc(db, 'multiUserBattleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef); // Use getDoc for fetching document

      if (docSnap.exists()) {
        const battleroom = docSnap.data();

        let user1ans = battleroom.user1.answers;
        let user2ans = battleroom.user2.answers;
        let user3ans = battleroom.user3.answers;
        let user4ans = battleroom.user4.answers;

        // Determine which user's answers to update based on userData
        if (userData?.data?.id === battleroom.user1.uid) {
          user1ans.push(selected_option);
          await updateDoc(documentRef, { 'user1.answers': user1ans });
        } else if (userData?.data?.id === battleroom.user2.uid) {
          user2ans.push(selected_option);
          await updateDoc(documentRef, { 'user2.answers': user2ans });
        } else if (userData?.data?.id === battleroom.user3.uid) {
          user3ans.push(selected_option);
          await updateDoc(documentRef, { 'user3.answers': user3ans });
        } else if (userData?.data?.id === battleroom.user4.uid) {
          user4ans.push(selected_option);
          await updateDoc(documentRef, { 'user4.answers': user4ans });
        }

        setTimeout(() => {
          setNextQuestion();
        }, 1000);

        // Check for correct answers
        checkCorrectAnswers(selected_option);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  // point check
  const checkCorrectAnswers = async option => {
    try {
      const documentRef = doc(db, 'multiUserBattleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef); // Use getDoc for fetching document

      if (docSnap.exists()) {
        const battleroom = docSnap.data();

        let user1name = battleroom.user1.name;
        let user2name = battleroom.user2.name;
        let user3name = battleroom.user3.name;
        let user4name = battleroom.user4.name;

        let user1image = battleroom.user1.profileUrl;
        let user2image = battleroom.user2.profileUrl;
        let user3image = battleroom.user3.profileUrl;
        let user4image = battleroom.user4.profileUrl;

        let user1correct = battleroom.user1.correctAnswers;
        let user2correct = battleroom.user2.correctAnswers;
        let user3correct = battleroom.user3.correctAnswers;
        let user4correct = battleroom.user4.correctAnswers;

        let user1uid = battleroom.user1.uid;
        let user2uid = battleroom.user2.uid;
        let user3uid = battleroom.user3.uid;
        let user4uid = battleroom.user4.uid;

        // Store data in local storage to get in result screen
        localStorageData(
          user1name,
          user2name,
          user3name,
          user4name,
          user1image,
          user2image,
          user3image,
          user4image,
          user1uid,
          user2uid,
          user3uid,
          user4uid
        );

        if (userData?.data?.id === battleroom.user1.uid) {
          let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);
          if (decryptedAnswer === option) {
            // Correct answer push
            await updateDoc(documentRef, { 'user1.correctAnswers': user1correct + 1 });
          }
        } else if (userData?.data?.id === battleroom.user2.uid) {
          let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);
          if (decryptedAnswer === option) {
            // Correct answer push
            await updateDoc(documentRef, { 'user2.correctAnswers': user2correct + 1 });
          }
        } else if (userData?.data?.id === battleroom.user3.uid) {
          let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);
          if (decryptedAnswer === option) {
            // Correct answer push
            await updateDoc(documentRef, { 'user3.correctAnswers': user3correct + 1 });
          }
        } else if (userData?.data?.id === battleroom.user4.uid) {
          let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, userData?.data?.firebase_id);
          if (decryptedAnswer === option) {
            // Correct answer push
            await updateDoc(documentRef, { 'user4.correctAnswers': user4correct + 1 });
          }
        }
      }
    } catch (error) {
      console.error("Error checking correct answers:", error);
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
      const documentRef = doc(db, 'multiUserBattleRoom', battleRoomDocumentId);

      const docSnap = await getDoc(documentRef); // Use getDoc for fetching document

      if (docSnap.exists()) {
        const battleroom = docSnap.data();

        let user1ans = battleroom.user1.answers;
        let user2ans = battleroom.user2.answers;
        let user3ans = battleroom.user3.answers;
        let user4ans = battleroom.user4.answers;

        if (userData?.data?.id === battleroom.user1.uid) {
          user1ans.push(-1);
          await updateDoc(documentRef, { 'user1.answers': user1ans });
        } else if (userData?.data?.id === battleroom.user2.uid) {
          user2ans.push(-1);
          await updateDoc(documentRef, { 'user2.answers': user2ans });
        } else if (userData?.data?.id === battleroom.user3.uid) {
          user3ans.push(-1);
          await updateDoc(documentRef, { 'user3.answers': user3ans });
        } else if (userData?.data?.id === battleroom.user4.uid) {
          user4ans.push(-1);
          await updateDoc(documentRef, { 'user4.answers': user4ans });
        }
      }
    } catch (error) {
      console.error("Error on timer expire:", error);
    } finally {
      setNextQuestion();
    }
  };

  //snapshot realtime data fetch
  useEffect(() => {
    const documentRef = doc(db, 'multiUserBattleRoom', battleRoomDocumentId);
    let executed = false
    let TotalUserLength = false

    let unsubscribe = onSnapshot(documentRef,
      doc => {
        let navigatetoresult = true

        let waiting = false

        if (doc.exists && doc.data()) {
          let battleroom = doc.data()

          let user1 = battleroom.user1

          let user2 = battleroom.user2

          let user3 = battleroom.user3

          let user4 = battleroom.user4

          let entryFee = battleroom.entryFee

          LoadGroupBattleData('entryFee', entryFee)

          // set answer in localstorage

          let user1correctanswer = user1.correctAnswers

          LoadGroupBattleData('user1CorrectAnswer', user1correctanswer)

          let user2correctanswer = user2.correctAnswers

          LoadGroupBattleData('user2CorrectAnswer', user2correctanswer)

          let user3correctanswer = user3.correctAnswers

          LoadGroupBattleData('user3CorrectAnswer', user3correctanswer)

          let user4correctanswer = user4.correctAnswers

          LoadGroupBattleData('user4CorrectAnswer', user4correctanswer)

          let navigateUserData = []

          navigateUserData = [user1, user2, user3, user4]

          setBattleUserData([user1, user2, user3, user4])

          // if user length is less than 1
          const newUser = [user1, user2, user3, user4]

          const usersWithNonEmptyUid = newUser.filter(elem => elem.uid !== '')

          if (!TotalUserLength) {
            TotalUserLength = true
            LoadGroupBattleData('totalusers', usersWithNonEmptyUid?.length)
          }

          // here check if user enter the game coin deduct its first time check
          if (!executed) {
            executed = true
            newUser.forEach(obj => {
              if (userData?.data?.id === obj.uid && obj.uid !== '' && entryFee > 0) {
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

          const newArray = newUser.filter(obj => Object.keys(obj.uid)?.length > 0)

          newUser.forEach(elem => {
            if (elem.obj === '') {
              playerremove.current = true
            }
          })

          if (newArray?.length < 2) {
            deleteBattleRoom(battleRoomDocumentId)
            MySwal.fire({
              title: t('Everyone has left the game'),
              icon: 'warning',
              showCancelButton: false,
              customClass: {
                confirmButton: 'Swal-confirm-buttons',
                cancelButton: "Swal-cancel-buttons"
              },
              confirmButtonText: t('ok')
            }).then(result => {
              if (result.isConfirmed) {
                // in between battle if all user left the game then one user get all coins of other users
                const winAmount = entryFee * groupBattledata.totalusers
                newArray.forEach(obj => {
                  if (userData?.data?.id == obj.uid && entryFee > 0) {
                    const status = 0
                    UserCoinScoreApi({
                      coins: winAmount,
                      title: t('won_battle'),
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

                navigate.push('/quiz-play')
              }
            })
          }

          //checking if every user has given all question's answer
          navigateUserData.forEach(elem => {
            if (elem.uid != '') {
              if (elem.answers?.length < questions?.length) {
                navigatetoresult = false
              } else if (elem.uid == userData?.data?.id && elem.answers?.length >= questions?.length) {
                child.current.pauseTimer()
                waiting = true
              }
            }
          })

          //user submitted answer and check other users answers length
          if (waiting) {
            setWaitforOthers(true)
          }

          //if  all user has submitted answers
          if (navigatetoresult) {
            onQuestionEnd()
            clashWinnerBadge()
            deleteBattleRoom(battleRoomDocumentId)
          }
        }
      },
      error => {
        console.log('err', error)
      }
    )

    let alluserArray = [
      groupBattledata.user1uid,
      groupBattledata.user2uid,
      groupBattledata.user3uid,
      groupBattledata.user4uid
    ]
    for (let i = 0; i < alluserArray?.length; i++) {
      const elem = alluserArray[i]
      if (userData?.data?.id == elem && playerremove) {
        navigate.push('/quiz-play') // Navigate to the desired page

        unsubscribe()

        break // Break the loop after calling the cleanup function
      }
    }

    return () => {
      // Cleanup function
      unsubscribe()

    }
  }, [userData?.data?.id, playerremove])

  useEffect(() => {
    checkCorrectAnswers()
  }, [])

  useEffect(() => {
    return () => {
      const documentRef = doc(db, 'multiUserBattleRoom', battleRoomDocumentId);




      try {
        runTransaction(db, async transaction => {
          let doc = await transaction.get(documentRef);
          let battleroom = doc.data();

          let user1uid = battleroom && battleroom.user1.uid;
          let user2uid = battleroom && battleroom.user2.uid;
          let user3uid = battleroom && battleroom.user3.uid;
          let user4uid = battleroom && battleroom.user4.uid;

          if (user1uid == userData?.data?.id) {
            transaction.update(documentRef, {
              'user1.name': '',
              'user1.uid': '',
              'user1.profileUrl': ''
            });
          } else if (user2uid == userData?.data?.id) {
            transaction.update(documentRef, {
              'user2.name': '',
              'user2.uid': '',
              'user2.profileUrl': ''
            });
          } else if (user3uid == userData?.data?.id) {
            transaction.update(documentRef, {
              'user3.name': '',
              'user3.uid': '',
              'user3.profileUrl': ''
            });
          } else if (user4uid == userData?.data?.id) {
            transaction.update(documentRef, {
              'user4.name': '',
              'user4.uid': '',
              'user4.profileUrl': ''
            });
          }
        });
      } catch (error) {
        console.error("Transaction failed:", error);
      }
    }
  }, [])

  const loggedInUserData = battleUserData.find(item => item.uid === userData?.data?.id);

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

  // send chat message 

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
            setMsgData(data)
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
              <Image src={msgData.message} height={50} width={50} alt="Message Image" />
            </div>
          )
        )
      ) : (
        <div>No message data available</div>
      )}
    </div>
  );





  const popUp = () => {

    if (msgData !== undefined) {
      return (
        <Space wrap className='msgPopUpWrapper'>
          <Popover
            content={content}
            overlayStyle={{ backgroundColor: '#f0f0f0' }}
            open={isVisible}
          >
          </Popover>
        </Space>
      );
    }

  };





  return (
    <React.Fragment>
      <div className='dashboardPlayUppDiv funLearnQuestionsUpperDiv selfLearnQuestionsUpperDiv text-end p-2 pb-0 '>
        <QuestionTopSection corrAns="" inCorrAns="" currentQuestion={currentQuestion} questions={questions} showAnswers={false} />
      </div>
      <div className="questions battlequestion groupbattle" ref={scroll}>
        <div className="inner__headerdash groupPlay_header">
          <div className="inner__headerdash_data">{questions && questions[0]["id"] !== "" ? <Timer ref={child} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} /> : ""}</div>
        </div>

        <QuestionMiddleSectionOptions questions={questions} currentQuestion={currentQuestion} setAnswerStatusClass={setAnswerStatusClass} handleAnswerOptionClick={handleAnswerOptionClick} probability={false} latex={true} />

        <div className='divider'>
          <hr style={{ width: '112%', backgroundColor: 'gray', height: '2px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ShowMessagePopUp />
        </div>

        <div className='user_data'>
          {loggedInUserData && (
            <>
              <div className='user_profile'>
                {msgData !== undefined && loggedInUserData?.uid == msgData.by && popUp()}

                <img src={loggedInUserData.profileUrl} alt='wrteam' onError={imgError} />
                <div className="userDataWrapper">
                  <p className='mt-3'>{loggedInUserData.name ? loggedInUserData.name : "Waiting..."}</p>
                  <div className='userpoints'>
                    <div className="rightWrongAnsDiv">
                      <span className='rightAns'>
                        {loggedInUserData.correctAnswers ? loggedInUserData.correctAnswers : 0} /{' '}
                        <span>{questions?.length}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>)}

          {/* Show the rest of the data */}

          {battleUserData?.map(data => (
            data.uid !== userData?.data?.id &&
              data.uid !== '' ? (
              <>
                <div className='opponent_image'>
                  {msgData !== undefined && loggedInUserData?.uid !== data.uid && data.uid == msgData.by && popUp()}
                  <img src={data.profileUrl} alt='wrteam' onError={imgError} />
                  <div className="opponentUserdataWrapper">
                    <p className='mt-3'>{data.name ? data.name : 'Waiting...'}</p>
                    <div className="rightWrongAnsDiv">
                      <span className='rightAns'>
                        {data.correctAnswers ? data.correctAnswers : 0} / <span>{questions?.length}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null
          ))}
        </div>


        {/* waiting popup */}

        <Modal closable={false} keyboard={false} centered open={waitforothers} footer={null} className="custom_modal_notify retry-modal playwithfriend">
          {waitforothers ? (
            <>
              <p>{t("wait_for_other_complete")}</p>
            </>
          ) : (
            ""
          )}
        </Modal>
      </div>
    </React.Fragment>
  )
}

GroupQuestions.propTypes = {
  questions: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func.isRequired
}

export default withTranslation()(GroupQuestions)
