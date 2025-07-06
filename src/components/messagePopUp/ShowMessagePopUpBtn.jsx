import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'antd';
import { Tabs } from 'antd';
import { Timestamp, addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { groupbattledata } from 'src/store/reducers/groupbattleSlice';
import { loginSuccess } from 'src/store/reducers/userSlice';
import emoji from './emoji_src'
import { Image } from 'react-bootstrap';
import {  getFirestoreId } from 'src/store/reducers/messageSlice';
import msgIcone from "../../assets/images/messageIcon.svg"
const ShowMessagePopUp = () => {
  const [modal2Open, setModal2Open] = useState(false);
  const [userData, setUserData] = useState()
  const [isTextMessage, setIsTextMessage] = useState(true)
  const [newDocID, setNewDocID] = useState()
  const db = getFirestore();
  const groupBattledata = useSelector(groupbattledata)
const dispatch = useDispatch()
  const by = useSelector(state => state.User)

  const onChange = (key) => {
    key == 1 ? setIsTextMessage(true) : setIsTextMessage(false)
  };
  const messageListData = [
    'Hello..!!',
    'How are you..?',
    'Fine..!!',
    'Have a nice day..',
    'Well played',
    'What a performance..!!',
    'Thanks..',
    'Welcome..',
    'Merry Christmas',
    'Happy new year',
    'Happy Diwali',
    'Good night',
    'Hurry Up',
    'Dudeeee',
  ];


  const handleClick = async (msg) => {
    if (by.data.id) {

      setModal2Open(false)
   


      const addMsg = async () => {
        const addData = await addDoc(collection(db, 'messages'), {
          by: by.data.id,
          isTextMessage: isTextMessage,
          message: msg,
          roomId: groupBattledata.roomID,
          timestamp: serverTimestamp(),
        })
        const newDocumentId = addData.id;
  
        setNewDocID(newDocumentId)
      }
      await addMsg();
    }
    if (newDocID !== undefined ) {
      dispatch(getFirestoreId(newDocID))
    }
  }



  const msg = messageListData.map(data => <button className='msg_btn' onClick={() => handleClick(data)} key={data}>{data}</button>);
  const emojis = emoji.map(data => <button className='emoji' onClick={() => handleClick(data.src)} key={data.id}><Image src={data.src} height="50px" width='50px' /></button>);
  
  const items = [
    {
      key: '1',
      label: 'messages',
      children: msg,
    },
    {
      key: '2',
      label: 'emojis',
      children: emojis,
    },
  ];


  return (
    <>

      <Button style={{backgroundColor: 'transparent', width: 'auto', height: 'auto', border: 'none',filter: 'none' }} onClick={() => setModal2Open(true)}>
        {<Image src={msgIcone.src}  height={50} width={50} alt="Message Icon"/>}
      </Button>
      <Modal
        title="Vertically centered modal dialog"
        centered
        open={modal2Open}
        onCancel={() => setModal2Open(false)}
        footer={null}
      >
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
      </Modal>
    </>
  );

}

export default ShowMessagePopUp