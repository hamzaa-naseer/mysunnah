"use client"
import React, { useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Modal, Tabs } from 'antd'
import { useRef } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useDispatch, useSelector } from 'react-redux'
import { categoriesApi, getusercoinsApi, UserCoinScoreApi } from 'src/store/actions/campaign'
import { selectCurrentLanguage } from 'src/store/reducers/languageSlice'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { battleDataClear, groupbattledata, LoadGroupBattleData } from 'src/store/reducers/groupbattleSlice'
import { Loadtempdata, playwithfreind, reviewAnswerShowSuccess } from 'src/store/reducers/tempDataSlice'
import { imgError, roomCodeGenerator, truncate } from 'src/utils'
import { settingsData, sysConfigdata } from 'src/store/reducers/settingsSlice'
import { Form } from 'react-bootstrap'
import { useRouter } from 'next/router'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import versusImg from 'src/assets/images/versus.svg'
import { IoShareSocialOutline } from "react-icons/io5";
import ShareMenu from 'src/components/Common/ShareMenu';
import { t } from 'i18next'
import coinimg from "src/assets/images/coin.svg"
import vsimg from "src/assets/images/vs.svg"
import { getFirestore, collection, doc, onSnapshot, getDocs, query, serverTimestamp, addDoc, updateDoc, deleteDoc, where, runTransaction, getDoc } from 'firebase/firestore';
import OTPInput from 'react-otp-input'
import Image from 'next/image'
import { baseRoomCode, getFirestoreDocIdForRoomcode, getRoomCode } from 'src/store/reducers/messageSlice'
import cat_placeholder_img from "../../../assets/images/Elite Placeholder.svg"
const PlaywithFriendBattle = () => {

  const MySwal = withReactContent(Swal)

  const db = getFirestore();

  const dispatch = useDispatch()

  // store data getz
  const userData = useSelector(state => state.User)

  const groupBattledata = useSelector(groupbattledata)

  const selectdata = useSelector(settingsData)

  const systemconfig = useSelector(sysConfigdata)

  const appdata = selectdata && selectdata.filter(item => item.type == 'app_name')

  const appName = appdata && appdata?.length > 0 ? appdata[0].message : ''

  const getData = useSelector(playwithfreind)

  const firestoreRoomData = useSelector(state => state.message)

  const [joinCode, setJoincode] = useState('');

  const TabPane = Tabs.TabPane

  const [category, setCategory] = useState({
    all: '',
    category_data: '',
    category_name: ""
  })
  const [loading, setLoading] = useState(true)

  const [shouldGenerateRoomCode, setShouldGenerateRoomCode] = useState(false)

  const [selectedCoins, setSelectedCoins] = useState({ all: '', selected: '' })

  const [playwithfriends, setPlaywithfriends] = useState(false)

  const [isButtonClicked, setIsButtonClicked] = useState(false)

  const [showStart, setShowStart] = useState(false)

  const [dociddelete, setDocidDelete] = useState(false)

  const [battleUserData, setBattleUserData] = useState([])

  const [joinuserpopup, setJoinUserPopup] = useState(false)

  const [EntryFeeCoin, setEntryFeeCoin] = useState(0)

  const [createdByroom, setCreatedByRoom] = useState()

  const [showCategoryNameOnJoinRoomS, setShowCategoryNameOnJoinRoomS] = useState('')

  const [roomCodeForJoiner, setRoomCodeForJoiner] = useState();

  const [fireCatId, setFireCatId] = useState();

  const [joinImage, setJoinImg] = useState();

  const [isloading, setIsLoading] = useState()

  const enteryFee = groupBattledata

  const navigate = useRouter()

  let languageid = getData.language_id

  let category_selected = systemconfig && systemconfig?.battle_mode_one_category == '1' ? category?.category_data?.id : ''

  let battle_mode_one_entry_coin_data = systemconfig && systemconfig?.battle_mode_one_entry_coin

  let username = userData?.data?.name || userData?.data?.email || userData?.data?.mobile

  let userprofile = userData?.data?.profile ? userData?.data?.profile : ''

  let useruid = userData?.data?.id

  let usercoins = userData && userData?.data?.coins

  // let cat_placeholder_img = '../../../assets/images/Elite Placeholder.svg'

  let selectedcoins = Number(selectedCoins.selected)

  let inputText = useRef(null)

  let roomiddata = groupBattledata.roomID

  let owner = useRef({
    readyplay: null,
    ownerID: null,
    roomid: null
  })



  // get category data
  const getAllData = () => {
    categoriesApi({
      type: 1,
      sub_type: 2,
      onSuccess: response => {
        let categoires = response.data
        // Filter the categories based on has_unlocked and is_premium
        const filteredCategories = categoires.filter(category => {
          return category.is_premium === '0'
        })
        setCategory({
          ...category,
          all: filteredCategories,
          category_data: filteredCategories[0],
          category_name: filteredCategories[0].category_name
        })
        setLoading(false)
      },
      onError: error => {
        setLoading(false)
        console.log(error)
      }
    })
  }

  // database collection
  const createBattleRoom = async (
    categoryId,
    name,
    profileUrl,
    uid,
    roomCode,
    roomType,
    entryFee,
    questionlanguageId
  ) => {
    try {
      let documentreference = await addDoc(collection(db, 'battleRoom'), {
        categoryId: categoryId,
        createdAt: serverTimestamp(),
        createdBy: uid,
        entryFee: entryFee ? entryFee : 0,
        languageId: questionlanguageId,
        readyToPlay: false,
        categoryName: category?.category_name,
        roomCode: roomCode ? roomCode : '',
        user1: {
          answers: [],
          name: name,
          points: 0,
          profileUrl: profileUrl,
          uid: uid,
          correctAnswers: 0
        },
        user2: {
          answers: [],
          name: '',
          points: 0,
          profileUrl: '',
          uid: '',
          correctAnswers: 0
        }
      })
      // created id by user to check for result screen
      LoadGroupBattleData('createdby', uid)
      LoadGroupBattleData('entryFee', entryFee)

      setShowStart(true)

      return await documentreference
    } catch (error) {
      toast.error(error)
    }
  }

  // delete battle room
  const deleteBattleRoom = async documentId => {
    try {
      await deleteDoc(doc(db, "battleRoom", documentId));
    } catch (error) {
      toast.error(error);
    }
  };

  // find room
  const searchBattleRoom = async (languageId, categoryId) => {
    try {
      const q = query(
        collection(db, 'battleRoom'),
        where('languageId', '==', languageId),
        where('categoryId', '==', categoryId),
        where('roomCode', '==', ''),
        where('user2.uid', '==', ''),
      );

      // Execute the query
      const userFindSnapshot = await getDocs(q);


      let userfinddata = userFindSnapshot.docs

      let index = userfinddata.findIndex(elem => {
        return elem.data().createdBy == useruid
      })

      if (index !== -1) {
        deleteBattleRoom(userfinddata[index].id)
        userfinddata.splice(userfinddata?.length, index)
      }

      return userfinddata
    } catch (err) {
      toast.error('Error getting document', err)
    }
  }

  // search room
  const searchRoom = async () => {
    setIsLoading(true)

    if (selectedCoins.selected === "") {
      toast.error("Please select coins and enter value in numeric value")
      return
    }

    let inputCoincheck = inputText.current.value
    if (Number(inputCoincheck) > Number(usercoins)) {
      toast.error(t('no_enough_coins'))
      return
    }

    try {
      let documents = await searchBattleRoom(languageid, category_selected)

      let roomdocid

      if (documents?.length !== 0 && documents.id) {
        let room = documents

        roomdocid = room.id
      } else {
        roomdocid = await createRoom()
      }

      // await subscribeToBattleRoom(roomdocid);
      LoadGroupBattleData('roomid', roomdocid)
      setIsLoading(false)

    } catch (error) {
      setIsLoading(false)

      toast.error(error)
      console.log(error)
    }

  }

  // redirect question screen
  const questionScreen = (roomcode, catid) => {
    navigate.push('/random-battle/play-with-friend-play')
    let data = {
      category_id: catid,
      room_id: roomcode,
      destroy_match: '0'
    }
    Loadtempdata(data)
  }

  //create room for battle
  const createRoom = async () => {

    // battleroom joiing state
    if (usercoins < 0 || usercoins === '0') {
      toast.error(t('no_enough_coins'))
      return
    }

    let roomCode = ''

    //genarate room code
    roomCode = roomCodeGenerator("onevsone")
    setShouldGenerateRoomCode(roomCode)
    LoadGroupBattleData('roomCode', roomCode)

    let data = await createBattleRoom(
      category_selected,
      username,
      userprofile,
      useruid,
      roomCode,
      'public',
      selectedcoins,
      languageid,

    )
    // popup user found with friend
    setPlaywithfriends(true)

    return data.id
  }
  // img from firestore for joiner


  // joinroom
  const joinRoom = async (name, profile, usernameid, roomcode, coin) => {
    setRoomCodeForJoiner(roomcode)
    try {
      if (!roomcode) {
        setIsButtonClicked(false)
        setJoinUserPopup(false)
        toast.error(t('enter_room_code'))
      } else {
        let result = await joinBattleRoomFrd(name, profile, usernameid, roomcode, coin)
        if (typeof result === 'undefined') {
          setIsButtonClicked(false)
          setJoinUserPopup(false)
          toast.error(t('room_code_not_valid'))
        } else {
          setJoinUserPopup(true)

          // await subscribeToBattleRoom(result.id);
          LoadGroupBattleData('roomid', result.id)

          const status = 1

          if (groupBattledata.entryFee > 0) {
            UserCoinScoreApi({
              coins: groupBattledata.entryFee,
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
      }
    } catch (e) {
      console.log('error', e)
    }
  }

  // get userroom
  const getMultiUserBattleRoom = async roomcode => {
    try {
      const q = query(collection(db, 'battleRoom'), where('roomCode', '==', roomcode));
      const typeBattle = await getDocs(q);
      return typeBattle;
    } catch (e) {
      console.log('error', e);
    }
  }

  // joinBattleRoomFrd
  const joinBattleRoomFrd = async (name, profile, usernameid, roomcode, coin) => {
    try {
      // check roomcode is valid or not
      let mulituserbattle = await getMultiUserBattleRoom(roomcode)

      // invalid room code
      if (mulituserbattle.docs === '') {
        toast.error(t('invalid_room_code  '))
      }

      // // game started code
      if (mulituserbattle.docs[0].data().readyToPlay) {
        toast.success(t('game_started'))
      }

      // // not enough coins
      // if (mulituserbattle.docs[0].data().entryFee > coin) {
      //     toast.error("no_enough_coins");
      //     return;
      // }

      //user2 update
      let entryfeecoind = mulituserbattle.docs[0].data().entryFee
      let showCategoryNameOnJoinRoom = mulituserbattle.docs[0].data().categoryName
      setEntryFeeCoin(entryfeecoind)
      setShowCategoryNameOnJoinRoomS(showCategoryNameOnJoinRoom)
      let docRef = mulituserbattle.docs[0].ref

      return runTransaction(db, async transaction => {
        let doc = await transaction.get(docRef)
        if (!doc.exists) {
          toast.error(t('document_not_exist'))
        }

        let userdetails = doc.data()

        let user2 = userdetails.user2

        if (user2.uid === '') {
          transaction.update(docRef, {
            'user2.name': name,
            'user2.uid': usernameid,
            'user2.profileUrl': profile
          })
        }
        return doc
      })

      //
    } catch (e) {
      console.log('error', e)
    }
  }

  // coins data
  const coinsdata = [
    { id: '1', num: battle_mode_one_entry_coin_data },
    { id: '2', num: battle_mode_one_entry_coin_data * 2 },
    { id: '3', num: battle_mode_one_entry_coin_data * 3 },
    { id: '4', num: battle_mode_one_entry_coin_data * 4 }
  ]

  // selected coins data
  const selectedCoinsdata = data => {
    setSelectedCoins({ ...selectedCoins, selected: data.num })
    inputText.current.value = ''
  }

  // start button
  const startGame = e => {
    let roomid = groupBattledata.roomID

    let docRef = doc(db, "battleRoom", roomid)

    return runTransaction(db, async transaction => {
      let doc = await transaction.get(docRef)
      if (!doc.exists) {
        toast.error(t('document_not_exist'))
      }

      let userdetails = doc.data()

      let user2 = userdetails.user2

      if (user2.uid !== '') {
        transaction.update(docRef, {
          readyToPlay: true
        })
        // subscribeToBattleRoom(roomid)
      } else {
        toast.error(t('player_not_join'))
      }

      return doc
    })
  }

  useEffect(() => {
    getAllData()
  }, [selectCurrentLanguage])

  // get id from localstorage for start button
  let createdby = groupBattledata.createdBy

  // oncancel creater room popup delete room
  const onCancelbuttondeleteBattleRoom = async documentId => {

    let documentRef = doc(db, "battleRoom", documentId)

    onSnapshot(documentRef,
      { includeMetadataChanges: true },
      doc => {
        if (doc.exists && doc.data()) {
          let battleroom = doc.data()

          let roomid = doc.id

          let createdby = battleroom.createdBy

          if (useruid == createdby) {
            MySwal.fire({
              text: t('room_deleted')
            })
            setJoincode("")
            deleteBattleRoom(roomid)
            battleDataClear()
          }
        }
      },
      error => {
        console.log('err', error)
      }
    )
  }

  // snapshot listner
  useEffect(() => {
    // subsscribebattle room
    if (!roomiddata) return;
    let documentRef = doc(db, 'battleRoom', roomiddata)
    onSnapshot(documentRef,
      { includeMetadataChanges: true },
      doc => {
        if (doc.exists && doc.data()) {
          let battleroom = doc.data()

          // state set doc id
          setDocidDelete(doc.id)

          let user1 = battleroom.user1

          let user2 = battleroom.user2

          let category_id = battleroom.categoryId

          setFireCatId(category_id)

          let user1uid = battleroom.user1.uid

          let user2uid = battleroom.user2.uid

          let readytoplay = battleroom.readyToPlay

          let createdby = battleroom.createdBy

          if (userData?.data?.id === user1uid) {
            setBattleUserData([user2])
          } else {
            setBattleUserData([user1])
          }

          let check = battleroom.readyToPlay

          let roomCode = battleroom.roomCode

          if (check) {
            questionScreen(roomCode, category_id)
          }

          // state popup of create and join room
          if (useruid == createdby) {
            setJoinUserPopup(false)
            setPlaywithfriends(true)
          } else {
            setJoinUserPopup(true)
            setPlaywithfriends(false)
          }

          owner.current.ownerID = createdby

          owner.current.readyplay = readytoplay

          // delete room by owner on click cancel button
          setCreatedByRoom(createdby)

          // if user2 empty then popup will remove
          if (user2uid == '') {
            owner.current.ownerID = null
            setJoinUserPopup(false)
          }
        } else {
          if (owner.current.readyplay == false && owner.current.ownerID !== null) {
            if (useruid !== owner.current.ownerID) {
              MySwal.fire({
                text: t('room_delet_owner')
              }).then(result => {
                if (result.isConfirmed) {
                  setJoincode("")
                  navigate.push('/random-battle/play-with-friend-battle')
                  return false
                }
              })
            }
          }
        }
      },
      error => {
        console.log('err', error)
      }
    )
  }, [groupBattledata])

  useEffect(() => {
    setSelectedCoins({ ...selectedCoins, selected: coinsdata[0].num })
  }, [])

  // on cancel join user button
  const onCanceljoinButton = async roomid => {
    setJoinUserPopup(false)

    try {
      setJoinUserPopup(false)
      const documentRef = doc(db, 'battleRoom', roomid)
      const battleroomSnapshot = await getDoc(documentRef)
      if (battleroomSnapshot.exists && battleroomSnapshot.data()) {
        await updateDoc(documentRef, {
          'user2.name': '',
          'user2.uid': '',
          'user2.profileUrl': ''
        });
      }

      navigate.push('/random-battle/play-with-friend-battle')
      setIsButtonClicked(false)
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const handleJoinButtonClick = () => {
    setIsButtonClicked(true)
    joinRoom(username, userprofile, useruid, joinCode, usercoins)
  }

  // select category
  const handleSelectCategory = e => {
    const index = e.target.selectedIndex
    const el = e.target.childNodes[index]
    let cat_data = JSON.parse(el.getAttribute('data'))
    let cat_name = el.getAttribute('name')
    setCategory({ ...category, category_data: cat_data, category_name: cat_name })
  }

  // share room code popUp handlers
  const handleSharePopup = () => {
    const sharePopup = document.getElementById('sharePopup');
    sharePopup.style.display = 'block'
  }
  const closeSharePopup = () => {
    const sharePopup = document.getElementById('sharePopup');
    sharePopup.style.display = 'none'
  }


  const currentUrl = process.env.NEXT_PUBLIC_APP_WEB_URL + navigate.asPath;
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };


  const handleBatlleFeesChange = (e) => {
    // toast.error(e.target.value)
    e.preventDefault();

    const inputValue = e.target.value;

    // Check if the input is a valid number or an empty string
    if (/^\d+$/.test(inputValue) || inputValue === '') {

      // Check if the numeric value is greater than zero
      if (e.target.value >= 0) {
        // Update state or perform other actions
        // (e.g., setSelectedCoins or handle other logic)
        setSelectedCoins({ ...selectedCoins, selected: e.target.value });
      } else {
        // Show an error message for non-positive values
        setSelectedCoins({ ...selectedCoins, selected: 0 });
      }
    } else {
      // Show an error message for invalid input
      toast.error("Please Enter Numeric Values");
    }

  }

  useEffect(() => {
    dispatch(reviewAnswerShowSuccess(false))
  }, [])

  useEffect(() => {
    if (fireCatId !== undefined && category.all !== '') {
      category.all.map((id) => {
        if (id.id == fireCatId) {
          setJoinImg(id.image)
        }
      })
    }
  }, [fireCatId])


  return (
    <>
      <Breadcrumb title={t('1 v/s 1 Battle')} content="" contentTwo="" />
      <div className='SelfLearning battlequiz my-5'>
        <div className='container'>
          <div className="playFrndWrapper">
            <div className='row morphisam'>
              {/* battle screen */}
              <div className='col-md-12  col-xl-12 col-xxl-12 col-12'>
                <h3 className='playFrndTitle'>{t("play_with_friend")}</h3>
              </div>
              <div className='col-md-12  col-xl-12 col-xxl-12 col-12'>
                <Tabs defaultActiveKey='1'>
                  <TabPane tab={t('create_room')} key='1'>
                    {(() => {
                      if (systemconfig && systemconfig.battle_mode_one_category == '1') {
                        return (
                          <div className='bottom__cat__box playFrndSelecter'>
                            <div className="seleterWrapper">
                              <Form.Select
                                aria-label='Default select example'
                                size='lg'
                                className='selectform'
                                onChange={e => handleSelectCategory(e)}
                              >
                                {loading ? (
                                  <option>{t('loading')}</option>
                                ) : (
                                  <>
                                    {category.all ? (
                                      category.all.map((cat_data, key) => {

                                        const { category_name } = cat_data
                                        return (
                                          <option key={key} value={cat_data.key} no_of={cat_data.no_of} name={cat_data.category_name} data={JSON.stringify(cat_data)}>
                                            {category_name}
                                          </option>
                                        )
                                      })
                                    ) : (
                                      <option>{t('no_cat_data_found')}</option>
                                    )}
                                  </>
                                )}
                              </Form.Select>
                            </div>
                          </div>
                        )
                      }
                    })()}
                    <div className='inner_content d-flex align-items-center flex-wrap'>
                      <span >
                        {t("entry_fees")}:
                      </span>
                      <ul className='coins_deduct d-flex ps-0 align-items-center my-3'>
                        {coinsdata.map((data, idx) => {
                          return (
                            <li key={idx} className={`list-unstyled ${data.num == selectedcoins ? 'active-one' : 'unactive-one'}`} onClick={e => selectedCoinsdata(data)}>
                              <img src={coinimg.src} alt='coin' />

                              <span>
                                {data.num}
                              </span>
                            </li>

                          )
                        })}
                        <div className='input_coins'>
                          <input
                            type='number'
                            placeholder='00'
                            min='0'
                            value={selectedCoins.selected}
                            onChange={(e) => handleBatlleFeesChange(e)}
                            // onChange={e => }
                            ref={inputText}
                          />
                        </div>
                      </ul>

                    </div>

                    {/* coins */}
                    <div className='total_coins my-4 ml-0'>
                      <h5 className=' text-center '>
                        {t('current_coins')} : {usercoins < 0 ? 0 : usercoins}
                      </h5>
                    </div>

                    {/* create room */}
                    <div className='create_room'>
                      {
                        isloading ?
                          <button className='btn btn-primary loader_div'>
                            <div class="room_loader"></div>
                          </button> :
                          <button className='btn btn-primary' onClick={() => searchRoom()}>
                            {t('create_room')}
                          </button>
                      }
                    </div>
                  </TabPane>
                  <TabPane tab={t('join_room')} key='2'>
                    <div className='join_room_code'>
                      <OTPInput
                        value={joinCode}
                        onChange={setJoincode}
                        numInputs={6}
                        containerStyle={"otpbox"}
                        renderSeparator={<span className='space'></span>}
                        renderInput={(props) => <input {...props} className="custom-input-class"></input>}
                      />

                    </div>
                    <div className='join_btn mt-4'>
                      <button className=' btn btn-primary' onClick={handleJoinButtonClick} disabled={isButtonClicked}>
                        {' '}
                        {t('join_room')}
                      </button>
                    </div>
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* play with friends modal */}

      <Modal
        maskClosable={false}
        centered
        open={playwithfriends}
        onOk={() => setPlaywithfriends(false)}
        onCancel={() => {
          setPlaywithfriends(false)
          onCancelbuttondeleteBattleRoom(dociddelete)
        }}
        footer={null}
        className='custom_modal_notify retry-modal playwithfriend'
      >
        {playwithfriends ? (
          <>
            <div className='randomplayer'>
              <div className='main_screen'>
                <h3 className='text-center headlineText'>
                  {t('play_with_friend')}
                </h3>
                <div class="join_battel_sub_header">{t('ready_for_quiz')}</div>
                <div className='room_code_screen'>
                  <h6 className='fw-bold mt-1 mb-3'>{t('game_start_soon')} </h6>
                  <h3 className='mt-2 mb-3'>{shouldGenerateRoomCode}</h3>
                  <div className='entry_fees_coins_battle'>{t('entry_fees')} &nbsp; :-&nbsp;<p className='coins_selected'>{` ${selectedCoins.selected} Coins`}</p> </div>
                  <div className='battle_line_break'></div>
                  <div className='battle_cat_image_main_div'>
                    <div className='battle_cat_image'>
                      {category.category_data.image !== '' ? <Image src={category.category_data.image} width={50} height={50} className='rounded'></Image>
                        :
                        <Image src={cat_placeholder_img} width={50} height={50} className='rounded'></Image>}
                    </div>
                    <div className='battle_code_bottom_cat'>{category.category_name}</div>
                  </div>

                  {process.env.NEXT_PUBLIC_SEO === "true" ? <>
                    <span className='shareIcon' onClick={showModal}>
                      <IoShareSocialOutline />
                    </span>
                    <p>{t('share_rc_frd')}</p>
                  </> : null}
                </div>
                <>
                  {modalVisible &&
                    <ShareMenu
                      currentUrl={currentUrl}
                      shouldGenerateRoomCode={shouldGenerateRoomCode}
                      appName={appName}
                      showModal={modalVisible}
                      hideModal={() => setModalVisible(false)}
                      entryFee={groupBattledata?.entryFee}
                      categoryName={category?.category_name}
                    />
                  }
                </>

                <div className='inner_Screen onevsone_colum_adj'>
                  <div className='user_profile'>
                    <img src={userData?.data?.profile} alt='wrteam' onError={imgError} />
                    <h5 className='my-3 fw-bold'>{truncate(userData?.data?.name || userData?.data?.email || userData?.data?.mobile, 10)}</h5>
                    <span className='createJoinSpan'>{t("creator")}</span>
                  </div>
                  {battleUserData?.map((data, index) => {
                    return (
                      <>
                        <div className='vs_image'>
                          <img src={versusImg.src} alt='versus' height={100} width={50} />
                        </div>
                        <div className='opponent_image' key={index}>
                          <img src={data.profileUrl} alt='wrteam' onError={imgError} />
                          <h5 className='my-3 fw-bold'>{truncate(data.name ? data.name : t("waiting"), 10)}</h5>
                          <span className='createJoinSpan'>{t("joiner")}</span>

                        </div>
                      </>
                    )
                  })}
                </div>
                {(() => {
                  if (userData?.data?.id == createdby) {
                    return (
                      <>
                        {showStart ? (
                          <div className='start_game'>
                            <button className='btn btn-primary' onClick={e => startGame(e)}>
                              {t('start_game')}
                            </button>
                          </div>
                        ) : null}
                      </>
                    )
                  }
                })()}
              </div>
            </div>
          </>
        ) : (
          ''
        )}
      </Modal>
      {/* join user popup */}
      {
        joinuserpopup ? (
          <Modal
            centered
            maskClosable={false}
            keyboard={false}
            open={joinuserpopup}
            onOk={() => setJoinUserPopup(false)}
            onCancel={() => {
              setJoinUserPopup(false)
              onCanceljoinButton(roomiddata)
            }}
            footer={null}
            className='custom_modal_notify retry-modal playwithfriend'
          >
            <>
              <div className='randomplayer'>
                <div className='main_screen'>

                  {/* <div className='showCategoryNameOnJoinRoomS'>Category: {showCategoryNameOnJoinRoomS}</div>
                  <div className='battel-join-top'>
                  {t("Entry Fee")}: 
                  <div  className='list-unstyled battle-coins'>
                  <img src={coinimg.src} alt='coin' /> 

                  <span className='textcolorehite'>
                  {EntryFeeCoin}
                  </span>
                  </div>
                </div> */}
                  <h3 class="text-center headlineText">{t('Play with a Friend')}</h3>
                  <div className='join_battel_sub_header'>{t('ready_for_quiz')}</div>
                  <div className='room_code_screen'>
                    <h6 className='fw-bold mt-1 mb-3'>{t('game_start_soon')}</h6>
                    <h3 className='mt-2 mb-3'>{roomCodeForJoiner}</h3>
                    <div className='entry_fees_coins_battle'>{t("entry_fees")}&nbsp;:-&nbsp;<p className='coins_selected'>{` ${EntryFeeCoin} Coins`}</p> </div>
                    <div className='battle_line_break'></div>
                    <div className='battle_cat_image_main_div'>
                      <div className='battle_cat_image'>
                        {joinImage !== '' ? <Image src={joinImage} width={50} height={50} className='rounded'></Image>
                          :
                          <Image src={cat_placeholder_img} width={50} height={50} className='rounded'></Image>}
                      </div>
                      <div className='battle_code_bottom_cat'>{showCategoryNameOnJoinRoomS}</div>
                    </div>
                  </div>
                  <div className='inner_Screen onevsone_colum_adj'>
                    <div className='user_profile'>
                      <img src={userData?.data?.profile} alt='wrteam' onError={imgError} />
                      <h5 className='my-3 fw-bold'> {truncate(userData?.data?.name || userData?.data?.email || userData?.data?.mobile, 12)}</h5>
                      <span className='createJoinSpan'>{t("creator")}</span>

                    </div>
                    {battleUserData?.map((data, index) => {
                      return (
                        <>
                          <div className='vs_image'>
                            <img src={vsimg.src} alt='versus' height={100} width={50} />
                          </div>
                          <div className='opponent_image' key={index}>
                            <img src={data.profileUrl} alt='wrteam' onError={imgError} />
                            <h5 className='my-3 fw-bold'>{truncate(data.name ? data.name : t('waiting'), 12)}</h5>
                            <span className='createJoinSpan'>{t("joiner")}</span>

                          </div>
                        </>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          </Modal>
        ) : (
          ''
        )
      }
    </>
  )
}

export default withTranslation()(PlaywithFriendBattle)
