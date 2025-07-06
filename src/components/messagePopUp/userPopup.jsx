import React, { useEffect, useState } from 'react';
import { Popover, Space } from 'antd';
import { collection, doc, getDoc, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { groupbattledata } from 'src/store/reducers/groupbattleSlice';

const UserPopup = ({ idForMsgPopUp,loggedInUserData }) => {

  const [isVisible, setIsVisible] = useState(false);
  const [msg, setMsg] = useState('');
  const [userId, setUserId] = useState();
  const [isText, setIsText] = useState(false);
  const db = getFirestore();
  const groupBattledata = useSelector(groupbattledata);
  const by = useSelector(state => state.User);

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
                      setIsText(data.isTextMessage);
            setMsg(data.message);
            setUserId(data.by);
            setIsVisible(true);
            setTimeout(() => {
                setIsVisible(false);
              }, 5000000000000);
            }
          }
        );
        });
    
        return () => unsubscribe();
    }
  }, [idForMsgPopUp]);
  
  const content = (
    <div>
      {isText ? <div>{msg}</div> : ''}
    </div>
  );

  return (
    <>
      {isVisible && (
        <Space wrap>
          <Popover
            content={content}
            overlayStyle={{ backgroundColor: '#f0f0f0' }}
            open={isVisible}
          >
            {/* You can put some content here if needed */}
          </Popover>
        </Space>
      )}
    </>
  );
};

export default UserPopup;
