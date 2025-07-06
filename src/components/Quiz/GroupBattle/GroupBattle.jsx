"use client"
import React, { Fragment, useEffect, useState, useRef } from 'react'
import { withTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Modal, Tabs } from 'antd'
import { Form } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { categoriesApi, createMultiRoomApi } from 'src/store/actions/campaign'
import { selectCurrentLanguage } from 'src/store/reducers/languageSlice'
import { settingsData, sysConfigdata } from 'src/store/reducers/settingsSlice'
import { battleDataClear, groupbattledata, LoadGroupBattleData } from 'src/store/reducers/groupbattleSlice'
import { Loadtempdata } from 'src/store/reducers/tempDataSlice'
import { imgError, roomCodeGenerator, truncate } from 'src/utils/index'
import { websettingsData } from 'src/store/reducers/webSettings'
import { useRouter } from 'next/router'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { IoShareSocialOutline } from "react-icons/io5";
import ShareMenu from 'src/components/Common/ShareMenu'
import coinimg from "src/assets/images/coin.svg"
import vsimg from "src/assets/images/vs.svg"
import { t } from 'i18next'
import { getFirestore, collection, doc, onSnapshot, getDocs, query, serverTimestamp, addDoc, updateDoc, deleteDoc, where, runTransaction, getDoc } from 'firebase/firestore';
import OTPInput from 'react-otp-input'
import Image from 'next/image'
import cat_placeholder_img from "src/assets/images/Elite Placeholder.svg"

const GroupBattle = () => {

  const MySwal = withReactContent(Swal)

  const db = getFirestore();

  // store data get
  const userData = useSelector(state => state.User)

  const systemconfig = useSelector(sysConfigdata)

  const groupBattledata = useSelector(groupbattledata)

  const websettingsdata = useSelector(websettingsData)

  const selectdata = useSelector(settingsData)

  const appdata = selectdata && selectdata.filter(item => item.type == 'app_name')

  // website link
  const web_link_footer = websettingsdata && websettingsdata.web_link_footer

  const appName = appdata && appdata?.length > 0 ? appdata[0].message : ''

  const [battleUserData, setBattleUserData] = useState([])

  const [joinCode, setJoincode] = useState('');

  const TabPane = Tabs.TabPane

  const [category, setCategory] = useState({
    all: '',
    category_data: '',
    category_name: ""
  })

  let playerremove = useRef(false)

  const [loading, setLoading] = useState(true)

  const [isButtonClicked, setIsButtonClicked] = useState(false)

  const [shouldGenerateRoomCode, setShouldGenerateRoomCode] = useState(false)

  const [selectedCoins, setSelectedCoins] = useState({ all: '', selected: '' })

  const [playwithfriends, setPlaywithfriends] = useState(false)

  const [EntryFeeCoin, setEntryFeeCoin] = useState(0)

  const [showCategoryNameOnJoinRoomS, setShowCategoryNameOnJoinRoomS] = useState()

  const [joinuserpopup, setJoinUserPopup] = useState(false)

  const [showStart, setShowStart] = useState(false)

  const [dociddelete, setDocidDelete] = useState(false)

  const [activeTab, setActiveTab] = useState('1');

  const battle_mode_group_entry_coin_data = systemconfig && systemconfig?.battle_mode_group_entry_coin

  const [createdByroom, setCreatedByRoom] = useState()

  const [fireCatId, setFireCatId] = useState();

  const [joinImage, setJoinImg] = useState();

  const [isloading, setIsLoading] = useState()

  const [createdBy, setCreatedBy] = useState()

  const navigate = useRouter()

  const [modalVisible, setModalVisible] = useState(false);
  const [roomCodeForJoiner, setRoomCodeForJoiner] = useState();

  const currentUrl = process.env.NEXT_PUBLIC_APP_WEB_URL + navigate.asPath;

  let category_selected = category?.category_data?.id

  let username = userData?.data?.name || userData?.data?.email || userData?.data?.mobile

  let userprofile = userData?.data?.profile ? userData?.data?.profile : ''

  let useruid = userData?.data?.id

  let usercoins = userData && userData?.data?.coins

  let selectedcoins = Number(selectedCoins.selected)

  let inputText = useRef(null)

  let roomiddata = groupBattledata.roomID

  let owner = useRef({
    readyplay: null,
    ownerID: null,
    roomid: null
  })

  // language mode

  // get category data
  const getAllData = () => {
    categoriesApi({
      type: 1,
      sub_type: 3,
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
        console.log(error)
      }
    })
  }

  // database collection
  const createBattleRoom = async (categoryId, name, profileUrl, uid, roomCode, roomType, entryFee) => {
    try {
      let documentreference = await addDoc(collection(db, 'multiUserBattleRoom'), {
        categoryId: categoryId,
        createdAt: serverTimestamp(),
        createdBy: uid,
        entryFee: entryFee ? entryFee : 0,
        readyToPlay: false,
        categoryName: category?.category_name,
        roomCode: roomCode ? roomCode : '',
        user1: {
          answers: [],
          correctAnswers: 0,
          name: name,
          profileUrl: profileUrl,
          uid: uid
        },
        user2: {
          answers: [],
          correctAnswers: 0,
          name: '',
          profileUrl: '',
          uid: ''
        },
        user3: {
          answers: [],
          correctAnswers: 0,
          name: '',
          profileUrl: '',
          uid: ''
        },
        user4: {
          answers: [],
          correctAnswers: 0,
          name: '',
          profileUrl: '',
          uid: ''
        }
      })
      // created id by user to check for result screen
      LoadGroupBattleData('createdby', uid)
      setShowStart(true)


      return await documentreference
    } catch (error) {
      console.log("Errpr", error)
      toast.error(error)
    }
  }

  // delete battle room
  const deleteBattleRoom = async documentId => {
    try {
      await deleteDoc(doc(db, "multiUserBattleRoom", documentId));
    } catch (error) {
      toast.error(error);
    }
  };


  // find room
  const searchBattleRoom = async categoryId => {
    try {
      const q = query(
        collection(db, 'multiUserBattleRoom'),
        where('categoryId', '==', categoryId),
        where('roomCode', '==', ''),
        where('user2.uid', '==', '')
      );

      // Execute the query
      const userFindSnapshot = await getDocs(q);

      // Extract documents from the snapshot
      const userFindData = userFindSnapshot.docs;

      let index = userFindData.findIndex(elem => {
        return elem.data().createdBy == useruid
      })

      if (index !== -1) {
        deleteBattleRoom(userFindData[index].id)
        userFindData.splice(userFindData?.length, index)
      }

      return userFindData
    } catch (err) {
      toast.error('Error getting document', err)
    }
  }

  // search room
  const searchRoom = async () => {
    setIsLoading(true)
    let inputCoincheck = inputText.current.value
    let usercoins = userData?.data?.coins

    if (selectedCoins.selected === "") {
      toast.error("Please select coins and enter value in numeric value")
      return
    }

    if (Number(inputCoincheck) > Number(usercoins)) {
      toast.error(t('no_enough_coins'))
      return
    }

    try {
      let documents = await searchBattleRoom(category_selected)

      let roomdocid

      if (documents && documents.length > 0) {
        let room = documents;
        roomdocid = room.id;
      } else {
        roomdocid = await createRoom();
      }

      LoadGroupBattleData('roomid', roomdocid)
      setIsLoading(false)
    } catch (error) {
      toast.error(error)
      console.log(error)
      setIsLoading(false)
    }
  }

  // redirect question screen
  const questionScreen = (roomCode, roomid) => {
    navigate.push('/group-battle/group-play')
    let data = {
      roomCode: roomCode,
      roomid: roomid
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
    roomCode = roomCodeGenerator("groupbattle")

    setShouldGenerateRoomCode(roomCode)

    LoadGroupBattleData('roomCode', roomCode)

    // pass room code in sql database for fetching questions
    createRoommulti(roomCode)
    let data = await createBattleRoom(
      systemconfig.battle_mode_group_category == '1' ? category_selected : '',
      username,
      userprofile,
      useruid,
      roomCode,
      'public',
      selectedcoins
    )

    // popup user found with friend
    setPlaywithfriends(true)

    return data.id
  }

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
          LoadGroupBattleData('roomid', result.id)
        }
      }
    } catch (e) {
      console.log('error', e)
    }
  }

  // get userroom
  const getMultiUserBattleRoom = async roomcode => {
    try {
      const q = query(collection(db, 'multiUserBattleRoom'), where('roomCode', '==', roomcode));
      const typeBattle = await getDocs(q);
      return typeBattle;
    } catch (e) {
      console.log('error', e);
    }
  };

  // joinBattleRoomFrd
  const joinBattleRoomFrd = async (name, profile, usernameid, roomcode, coin) => {
    try {
      // check roomcode is valid or not
      let mulituserbattle = await getMultiUserBattleRoom(roomcode)

      // // game started code
      if (mulituserbattle.docs[0].data().readyToPlay) {
        toast.success('game_started')
      }

      // // not enough coins
      if (mulituserbattle.docs[0].data().entryFee > coin) {
        toast.error(t('no_enough_coins'))
        return
      }
      let entryfeecoind = mulituserbattle.docs[0].data().entryFee
      let showCategoryNameOnJoinRoom = mulituserbattle.docs[0].data().categoryName

      setEntryFeeCoin(entryfeecoind)
      setShowCategoryNameOnJoinRoomS(showCategoryNameOnJoinRoom)
      //user2 update
      let docRef = mulituserbattle.docs[0].ref

      return runTransaction(db, async transaction => {
        let doc = await transaction.get(docRef);

        if (!doc.exists) {
          toast.error('Document does not exist!');
        }

        let userDetails = doc.data();

        let user2 = userDetails.user2;
        let user3 = userDetails.user3;
        let user4 = userDetails.user4;

        if (user2.uid === '') {
          transaction.update(docRef, {
            'user2.name': name,
            'user2.uid': usernameid,
            'user2.profileUrl': profile
          });
        } else if (user3.uid === '') {
          transaction.update(docRef, {
            'user3.name': name,
            'user3.uid': usernameid,
            'user3.profileUrl': profile
          });
        } else if (user4.uid === '') {
          transaction.update(docRef, {
            'user4.name': name,
            'user4.uid': usernameid,
            'user4.profileUrl': profile
          });
        } else {
          toast.error(t('room_full'));
        }

        return doc;
      });

      //
    } catch (e) {
      console.log('error', e)
    }
  }

  // coins data
  const coinsdata = [
    { id: '1', num: battle_mode_group_entry_coin_data },
    { id: '2', num: battle_mode_group_entry_coin_data * 2 },
    { id: '3', num: battle_mode_group_entry_coin_data * 3 },
    { id: '4', num: battle_mode_group_entry_coin_data * 4 }
  ]

  // selected coins data
  const selectedCoinsdata = data => {
    setSelectedCoins({ ...selectedCoins, selected: data.num })
    inputText.current.value = ''
  }

  // start button
  const startGame = e => {
    let roomId = groupBattledata.roomID;

    let docRef = doc(db, 'multiUserBattleRoom', roomId);

    return runTransaction(db, async transaction => {
      let doc = await transaction.get(docRef);
      if (!doc.exists) {
        toast.error('Document does not exist!');
      }

      let userDetails = doc.data();

      let user2 = userDetails.user2;
      let user3 = userDetails.user3;
      let user4 = userDetails.user4;

      if (user2.uid !== '' || user3.uid !== '' || user4.uid !== '') {
        transaction.update(docRef, {
          readyToPlay: true
        });
      } else {
        toast.error(t('player_not_join'));
      }
      return doc;
    });
  }

  // get id from localstorage for start button
  let createdby = groupBattledata.createdBy

  // select category
  const handleSelectCategory = e => {
    const index = e.target.selectedIndex
    const el = e.target.childNodes[index]
    let cat_data = JSON.parse(el.getAttribute('data'))
    let cat_name = el.getAttribute('name')
    setCategory({ ...category, category_data: cat_data, category_name: cat_name })
  }

  // pass room code in sql database for fetching questions
  const createRoommulti = roomCode => {
    createMultiRoomApi({
      room_id: roomCode,
      room_type: 'public',
      category: category.selected ? category.selected : '',
      no_of_que: '10',
      onSuccess: resposne => { },
      onError: error => {
        console.log(error)
      }
    })
  }

  useEffect(() => {

    const fetchData = async () => {
      try {
        // const documentRef = collection(db, 'multiUserBattleRoom', roomiddata);
        if (!roomiddata) return;
        const documentRef = await doc(db, 'multiUserBattleRoom', roomiddata);
        const unsubscribe = onSnapshot(documentRef, { includeMetadataChanges: true }, (doc) => {
          if (doc.exists && doc.data()) {
            let battleroom = doc.data()

            // state set doc id
            setCreatedBy(battleroom.createdBy);
            setDocidDelete(doc.id)
            setFireCatId(battleroom.categoryId);
            let roomid = doc.id

            let user1 = battleroom.user1
   
            let user2 = battleroom.user2

            let user3 = battleroom.user3

            let user4 = battleroom.user4

            let user1uid = battleroom.user1.uid
            let user2uid = battleroom.user2.uid

            let user3uid = battleroom.user3.uid

            let user4uid = battleroom.user4.uid

            let readytoplay = battleroom.readyToPlay

            // filter user data

            // if user id is equal to login id then remove id
            if (userData?.data?.id === user1uid) {
              setBattleUserData([user2, user3, user4])
            }

            if (userData?.data?.id === user2uid) {
              setBattleUserData([user1, user3, user4])
            }

            if (userData?.data?.id === user3uid) {
              setBattleUserData([user1, user2, user4])
            }

            if (userData?.data?.id === user4uid) {
              setBattleUserData([user1, user2, user3])
            }

            // check ready to play
            let check = battleroom.readyToPlay

            //room code
            let roomCode = battleroom.roomCode

            // question screen
            if (check) {
              questionScreen(roomCode, roomid)
            }

            let createdby = battleroom.createdBy

            // state popup of create and join room

            if (useruid == createdby) {
              setJoinUserPopup(false)
              setPlaywithfriends(true)
            } else {
              setJoinUserPopup(true)
              setPlaywithfriends(false)
            }

            // LoadGroupBattleData("createdby", createdby);

            owner.current.ownerID = createdby

            owner.current.readyplay = readytoplay

            // delete room by owner on click cancel button
            setCreatedByRoom(createdby)

            if (user2uid === '') {
              owner.current.ownerID = null
              setJoinUserPopup(false)
            }

            const newUser = [user1, user2, user3, user4]

            newUser.forEach(elem => {
              if (elem.obj === '') {
                playerremove.current = true
              }
            })
          } else {
            if (owner.current.readyplay == false && owner.current.ownerID !== null) {
              if (useruid !== owner.current.ownerID) {
                MySwal.fire({
                  text: t('room_delet_owner')
                }).then(result => {
                  if (result.isConfirmed) {
                    setJoincode("")
                    navigate.push('/quiz-play')
                    return false
                  }
                })
              }
            }
          }
        }, (error) => {
          console.log('Error fetching document:', error);
        });

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
            // LoadGroupBattleData("roomid", "");
            break // Break the loop after calling the cleanup function
          }
        }
        // Cleanup function
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.log('An error occurred:', error);
      }
    };

    fetchData();
  }, [groupBattledata, userData?.data?.id, playerremove])

  // oncancel creater room popup delete room
  const onCancelbuttondeleteBattleRoom = async documentId => {
    let documentRef = doc(db, 'multiUserBattleRoom', documentId);

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

  // on cancel join user button
  const onCanceljoinButton = async roomId => {
    try {
      setJoinUserPopup(false)
      const documentRef = doc(db, 'multiUserBattleRoom', roomId);
      const battleroomSnapshot = await getDoc(documentRef)

      if (battleroomSnapshot.exists && battleroomSnapshot.data()) {
        const battleroom = battleroomSnapshot.data()
        const { user2, user3, user4 } = battleroom
        const { uid: user2uid } = user2
        const { uid: user3uid } = user3
        const { uid: user4uid } = user4

        if (user2uid === useruid) {
          await updateDoc(documentRef, {
            'user2.name': '',
            'user2.uid': '',
            'user2.profileUrl': ''
          });
          setJoincode("")
        } else if (user3uid === useruid) {
          await updateDoc(documentRef, {
            'user3.name': '',
            'user3.uid': '',
            'user3.profileUrl': ''
          });
          setJoincode("")
        } else if (user4uid === useruid) {
          await updateDoc(documentRef, {
            'user4.name': '',
            'user4.uid': '',
            'user4.profileUrl': ''
          });
          setJoincode("")
        }
      }

      navigate.push('/quiz-play')
    } catch (error) {
      console.log('Error:', error)
    }
  }

  useEffect(() => {
    setSelectedCoins({ ...selectedCoins, selected: coinsdata[0].num })
    // pass room code in sql database for fetching questions
    createRoommulti()
  }, [])

  useEffect(() => {
    getAllData()
  }, [selectCurrentLanguage])

  const handleJoinButtonClick = () => {
    setIsButtonClicked(true)
    joinRoom(username, userprofile, useruid, joinCode, usercoins)
  }

  // share room code popUp handlers
  const handleSharePopup = () => {
    setModalVisible(true)
  }
  const closeSharePopup = () => {
    // const sharePopup = document.getElementById('sharePopup');
    // sharePopup.style.display = 'none'
    setModalVisible(false)

  }

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

  const handleTabChange = (key) => {
    setActiveTab(key);
  };
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
      <Breadcrumb title={t('Group Battle')} content={t('')} contentTwo="" />
      <div className='SelfLearning battlequiz my-5'>
        <div className='container'>
          <div className="playFrndWrapper">

            <div className='row morphisam'>
              <div className='col-md-12  col-xl-12 col-xxl-12 col-12 '>
                <h2 className='text-center tabTitle'>
                  {activeTab === '1' ? `${t('create')} ${t('Group Battle')} ` : `${t('join')} ${t('Group Battle')} `}
                </h2>
                <Tabs defaultActiveKey='1' activeKey={activeTab} onChange={handleTabChange}>

                  <TabPane tab={t('create_room')} key='1' >
                    {/* category select */}
                    {(() => {
                      if (systemconfig.battle_mode_group_category === '1') {
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
                      <ul className='coins_deduct groupCoinsDeduct d-flex ps-0 align-items-center my-3'>
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
                            ref={inputText}
                          />
                        </div>
                      </ul>

                    </div>

                    {/* coins */}
                    <div className='total_coins my-4 ml-0'>
                      <h5 className=' text-center '>
                        {t('current_coins')} : {userData?.data?.coins < 0 ? 0 : userData?.data?.coins}
                      </h5>
                    </div>

                    {/* create room */}
                    <div className='create_room'>{
                      isloading ?
                        <button className='btn btn-primary loader_div'>
                          <div class="room_loader"></div>
                        </button> :
                        <button className='btn btn-primary' onClick={() => searchRoom()}>
                          {t('create_room')}
                        </button>}
                    </div>
                  </TabPane>
                  <TabPane tab={t('join_room')} key='2' className='groupBattleTab'>
                    <h5 className=' mb-4 text-center'>{t('enter_room_code_here')}</h5>
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
                      <button className='btn btn-primary' onClick={handleJoinButtonClick} disabled={isButtonClicked}>
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
                <div className='room_code_screen'>
                  <h6 className='mt-1 mb-3'>{t('game_start_soon')} </h6>
                  <h3 className='mt-2 mb-3'>{shouldGenerateRoomCode}</h3>
                  <div className='entry_fees_coins_battle'>{t("entry_fees")} &nbsp;:-&nbsp;<p className='coins_selected'>{` ${selectedCoins.selected} Coins`}</p> </div>
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
                    <span className='shareIcon' onClick={handleSharePopup}>
                      <IoShareSocialOutline />
                    </span>
                    <p>{t('share_rc_frd')}</p>
                  </> : null}
                </div>

                <div className='share' id='sharePopup'>
                  {modalVisible &&
                    <ShareMenu
                      currentUrl={currentUrl}
                      shouldGenerateRoomCode={shouldGenerateRoomCode}
                      appName={appName}
                      showModal={modalVisible}
                      hideModal={() => setModalVisible(false)}
                      entryFee={selectedCoins?.selected}
                      categoryName={category?.category_name}
                    />
                  }
                </div>

                <div className='inner_Screen battel_join_carddd'>
                  <div className='user_profile'>
                    <img src={userData?.data?.profile} alt='wrteam' onError={imgError} />
                    <h5 className='my-3 fw-bold'>{truncate(userData?.data?.name || userData?.data?.email || userData?.data?.mobile, 10)}</h5>
                    <span className='createJoinSpan'>{t("creator")}</span>
                  </div>
                  {battleUserData?.map((data, index) => {
                    return (
                      <>

                        <div className='opponent_image' key={index}>
                          <img src={data.profileUrl} alt='wrteam' onError={imgError} />
                          <h5 className='my-3  fw-bold'>{truncate(data.name ? data.name : t("waiting"), 10)}</h5>
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
      {joinuserpopup ? (
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
                <div className='text-center headlineText'>{`${t('join')} ${t('Group Battle')} `}</div>
                <div className='room_code_screen'>
                  <h6 className='fw-bold mt-1 mb-3'>{t('game_start_soon')}</h6>
                  <h3 className='mt-2 mb-3'>{roomCodeForJoiner}</h3>
                  <div className='entry_fees_coins_battle'>{t("entry_fees")}&nbsp;:-&nbsp;<p className='coins_selected'>{EntryFeeCoin}&nbsp; {t("coins")}</p> </div>
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
                <div className='inner_Screen battel_join_carddd'>
                  <div className='user_profile'>
                    <img src={userData?.data?.profile} alt='wrteam' onError={imgError} />
                    <h5 className='my-3 fw-bold'>{truncate(userData?.data?.name || userData?.data?.email || userData?.data?.mobile, 12)}</h5>

                    <span className='createJoinSpan fw-bold'>{t("joiner")}</span>
                  </div>
                  {battleUserData?.map((data, index) => {
                    return (
                      <>
                        <div className='opponent_image' key={index}>
                          <img src={data.profileUrl} alt='wrteam' onError={imgError} />
                          <h5 className='my-3 fw-bold'> {truncate(data.name ? data.name : t("waiting"), 10)}</h5>
                          {
                            data.uid && createdBy && data.uid == createdBy ?
                              <span className='fw-bold createJoinSpan adj_size_for_creator'>{t("creator")}</span> : <span className=' fw-bold createJoinSpan'>{t("joiner")}</span>
                          }
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
      )}
    </>
  )
}

export default withTranslation()(GroupBattle)
