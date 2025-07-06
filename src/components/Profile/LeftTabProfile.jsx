import userSettingIcon from 'src/assets/images/Usersetting.svg'
import bookmarkIcon from 'src/assets/images/bookmark.svg'
import statisticsIcon from 'src/assets/images/Statistics.svg'
import badgesIcon from 'src/assets/images/badges.svg'
import leaderboardIcon from 'src/assets/images/leaderboard.svg'
import walletIcon from 'src/assets/images/Wallet.svg'
import inviteIcon from 'src/assets/images/invitedfriend.svg'
import coinIcon from 'src/assets/images/Coinhistory.svg'
import { t } from "i18next";
import { useRouter } from "next/router";
import { sysConfigdata } from "src/store/reducers/settingsSlice";
import { useSelector } from "react-redux";
import { Modal } from 'antd'
import { useState } from 'react'
import FirebaseData from 'src/utils/Firebase'
import { deleteuserAccountApi } from 'src/store/actions/campaign'
import Swal from 'sweetalert2'
import { logout } from 'src/store/reducers/userSlice'
import warningImg from 'src/assets/images/logout.svg'
import deleteAccImg from 'src/assets/images/deleteAcc.svg'
import logouttabImg from "src/assets/images/logout-tab.svg"
import DeleteImg from "src/assets/images/Delete.svg"
import { signOut } from 'firebase/auth'

const LeftTabProfile = () => {

  const demoValue = process.env.NEXT_PUBLIC_DEMO === 'true';

  const systemconfig = useSelector(sysConfigdata);

  const router = useRouter();

  const { auth } = FirebaseData()

  const [logoutModal, setLogoutModal] = useState(false)

  const [deleteAccModal, setDeleteAccModal] = useState(false)

  const path = router.pathname

  // sign out
  const handleSignout = e => {
    e.preventDefault()
    setLogoutModal(true)
  }


  const handleConfirmLogout = () => {
    logout()
    signOut(auth)
    router.push('/')
    setLogoutModal(false)
  }

  const handleConfirmDeleteAcc = () => {
    deleteuserAccountApi({
      onSuccess: () => {
        Swal.fire(t('deleted'), t('Account Deleted Successfully!'), 'success')
        // Current signed-in user to delete
        const firebaseUser = auth.currentUser
        firebaseUser
          .delete()
          .then(() => {
            // User deleted.
          })
          .catch(error => {
            console.log(error)
          })
        logout()
        signOut(auth)
        router.push('/')
        setDeleteAccModal(false)
      },
      onError: (error) => {
        if (demoValue) {
          Swal.fire(t('ops'), t('Not allowed in demo version'))
        } else {
          Swal.fire(t('ops'), t('Please '), t("try_again"), 'error')
        }
      }
    }
    )
  }

  // delete user account
  const deleteAccountClick = e => {
    e.preventDefault()
    setDeleteAccModal(true)
  }


  return (
    <>

      < div className='tab-headers' >
        <div className={`tab-header ${path === '/profile' ? 'active' : ''}`} onClick={() => router.push("/profile")}>
          <span>
            <img src={userSettingIcon.src} alt="profile" className='profileTabIcon' />
          </span>
          <span> {t('profile')}</span>
        </div>
        <div className={`tab-header ${path === '/profile/statistics' ? 'active' : ''}`} onClick={() => router.push("/profile/statistics")}>
          <span><img src={statisticsIcon.src} alt="statistics" /></span>
          <span> {t('statistics')}</span>
        </div>

        {/* <div className={`tab-header ${path === '/profile/bookmark' ? 'active' : ''}`} onClick={() => router.push("/profile/bookmark")}>
          <span><img src={bookmarkIcon.src} alt="bookmark" className='bookmarkIcon' /> </span>
          <span>{t('bookmark')}</span>
        </div> */}

        {/* <div className={`tab-header ${path === '/profile/badges' ? 'active' : ''}`} onClick={() => router.push("/profile/badges")} >
          <span><img src={badgesIcon.src} alt="badges" /></span>
          <span>{t('badges')}</span>
        </div> */}

        <div className={`tab-header ${path === '/profile/leaderboard' ? 'active' : ''}`} onClick={() => router.push("/profile/leaderboard")} >
          <span><img src={leaderboardIcon.src} alt="leaderboard" /></span>
          <span>{t('leader_board')}</span>
        </div>

        <div className={`tab-header ${path === '/profile/coin-history' ? 'active' : ''}`} onClick={() => router.push("/profile/coin-history")}>
          <span><img src={coinIcon.src} alt="coin-history" /></span>
          <span>{t('coin_history')}</span>
        </div>
        {systemconfig?.payment_mode === "1" ?
          <div className={`tab-header ${path === '/profile/wallet' ? 'active' : ''}`} onClick={() => router.push("/profile/wallet")}>
            <span><img src={walletIcon.src} alt="wallet" /></span>
            <span> {t('wallet')}</span>
          </div>
          : null}
        {/* <div className={`tab-header ${path === '/profile/invite-friends' ? 'active' : ''}`} onClick={() => router.push("/profile/invite-friends")}>
                    <span><img src={inviteIcon.src} alt="invite-friends" /></span>
                    <span> {t('invite_friends')} </span>
                </div> */}
        <div className="tab-header" onClick={(e) => handleSignout(e)}>
          <span><img src={logouttabImg.src} alt="invite-friends" /></span>
          <span> {t('logout_account')} </span>
        </div>
        <div className="tab-header" onClick={(e) => deleteAccountClick(e)}>
          <span><img src={DeleteImg.src} alt="invite-friends" /></span>
          <span> {t('delete_account')} </span>
        </div>
      </div >

      <Modal
        maskClosable={false}
        centered
        open={logoutModal}
        onOk={() => setLogoutModal(false)}
        onCancel={() => {
          setLogoutModal(false)
        }}
        footer={null}
        className='logoutModal'
      >
        <div className="logoutWrapper">
          <span><img src={warningImg.src} alt="" /></span>
          <span className='headline'>{t("logout")}</span>
          <span className='confirmMsg'>{t("sure_logout")}</span>
        </div>

        <div className="logoutBtns">
          <span className='yes' onClick={handleConfirmLogout}>{t("yes_logout")}</span>
          <span className='no' onClick={() => setLogoutModal(false)}>{t("keep_login")}</span>
        </div>
      </Modal>

      <Modal
        maskClosable={false}
        centered
        open={deleteAccModal}
        onOk={() => setDeleteAccModal(false)}
        onCancel={() => {
          setDeleteAccModal(false)
        }}
        footer={null}
        className='logoutModal'
      >
        <div className="logoutWrapper">
          <span><img src={deleteAccImg.src} alt="" /></span>
          <span className='headline'>{t('delete_account')}</span>
          <span className='confirmMsg'>{t("sure_delete_ac")}</span>
        </div>

        <div className="logoutBtns">
          <span className='yes' onClick={handleConfirmDeleteAcc}>{t("yes_delete")}</span>
          <span className='no' onClick={() => setDeleteAccModal(false)}>{t("keep_account")}</span>
        </div>
      </Modal>

    </>
  )
}

export default LeftTabProfile
