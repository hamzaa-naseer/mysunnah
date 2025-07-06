"use client"
import React, { useRef, useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { FaMobileAlt, FaEnvelope, FaLock } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import toast from 'react-hot-toast'
import { withTranslation } from 'react-i18next'
import { register } from 'src/store/reducers/userSlice'
import FirebaseData from 'src/utils/Firebase'
import 'swiper/css/effect-fade'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BsEyeSlash, BsEye } from 'react-icons/bs'
import NewUser from 'src/components/Common/NewUser'
import dynamic from 'next/dynamic'
import { t } from 'i18next'
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAdditionalUserInfo, sendEmailVerification, signInWithPopup } from 'firebase/auth'
import { handleFirebaseAuthError } from 'src/utils'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { useSelector } from 'react-redux'
import { HiOutlineMail } from "react-icons/hi";
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })

const SignUp = () => {
  const [loading, setLoading] = useState(false)
  const [newUserScreen, setNewUserScreen] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    mobile: '',
    email: '',
    profile: '',
    all_time_rank: '',
    all_time_score: '',
    coins: '',
    friends_code: ''
  })

  const [type, setType] = useState("password");

  const [type2, setType2] = useState("password");

  const [Icon, setIcon] = useState(<BsEyeSlash />);

  const [Icon2, setIcon2] = useState(<BsEyeSlash />);

  const [confPassword, setConfPassword] = useState('');

  const emailRef = useRef()

  const passwordRef = useRef()

  const router = useRouter()

  const { auth } = FirebaseData()

  const systemconfig = useSelector(sysConfigdata)
  //signup
  const signup = async (email, password) => {
    let promise = await new Promise(function (resolve, reject) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          let resposne = userCredential.user
          sendEmailVerification(resposne)
          toast.success(t('email_sent'))
          resolve(userCredential)
          auth.signOut()
        })
        .catch(error => reject(error))
    })
    return promise
  }

  //email signin
  const handleSignup = e => {
    e.preventDefault()
    const email = emailRef.current.value
    const password = passwordRef.current.value
    if (password === confPassword) {
      setLoading(true)
      signup(email, password)
        .then(response => {
          setLoading(false)
          router.push('/')
        })
        .catch(err => {
          toast.error(err.message)
          setLoading(false)
        })
    } else {
      toast.error(t('password_mismatch_warning'))
    }
  }

  //google sign in
  const signInWithGoogle = async (e) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
      const response = await signInWithPopup(auth, provider);
      const { user, additionalUserInfo } = response;

      setProfile(user);
      setProfile((values) => ({ ...values, auth_type: 'gmail' }));
      const { isNewUser } = getAdditionalUserInfo(response)
      if (isNewUser) {
        // If new User, show the Update Profile Screen
        setNewUserScreen(true);
      } else {
        const { uid: firebase_id, email, phoneNumber: phone, photoURL: image_url } = user;
        const name = null;
        const fcm_id = null;
        const friends_code = null;

        register(
          firebase_id,
          'gmail',
          name,
          email,
          image_url,
          phone,
          fcm_id,
          friends_code,
          () => {
            setLoading(false);
            toast.success(t('successfully_login'));
            router.push('/quiz-play');
          },
          () => {
            if (error === "126") {
              toast.error(t("ac_deactive"));
            } else {
              toast.error(`${t('Please ')}${t('try_again')}`);
              console.log("signUp signInWithGoogle", error);

            }
          }
        );
      }

      setLoading(false);
    } catch (error) {
      handleFirebaseAuthError(error.code)
      setLoading(false);
    }
  };

  // show password
  const handletoggle = () => {
    if (type === "password") {
      setIcon(<BsEye />);
      setType("text");
    } else {
      setIcon(<BsEyeSlash />);
      setType("password");
    }
  };
  // show confirm password
  const handletoggle2 = () => {
    if (type2 === "password") {
      setIcon2(<BsEye />);
      setType2("text");
    } else {
      setIcon2(<BsEyeSlash />);
      setType2("password");
    }
  };

  return (
    <Layout>
      <div className='signup wrapper loginform mt-5'>
        {!newUserScreen ? (
          <div className='custom-container glassmorcontain'>
            <div className='row morphisam'>
              <div className='col-12 border-line position-relative'>
                <div className='inner__login__form outerline'>
                  <h3 className='mb-4 text-capitalize '>{t('sign_up')}</h3>

                  <div className='social__icons'>
                    <ul>
                      {systemconfig.gmail_login === '1' && <li>
                        <button className='social__icons_btn' onClick={signInWithGoogle}>
                          <FcGoogle /> {t("Login with Google")}
                        </button>
                      </li>}
                      {systemconfig.phone_login === '1' && <li>
                        <button
                          className='social__icons_btn'
                          onClick={() => {
                            router.push('/auth/otp-verify')
                          }}
                        >
                          <FaMobileAlt /> {t("Login with Phone")}
                        </button>
                      </li>}
                    </ul>
                  </div>
                  {(systemconfig.phone_login === '1' || systemconfig.gmail_login === '1') && systemconfig.email_login === '1' && <div className='continue'>
                    <span className='line'></span>
                    <p>{t("Or continue with Email")}</p>
                    <span className='line'></span>
                  </div>}
                  {systemconfig.email_login === '1' && <Form onSubmit={e => handleSignup(e)}>
                    <Form.Group className='mb-3 position-relative d-inline-block w-100' controlId='formBasicEmail'>
                      <Form.Control
                        type='email'
                        placeholder={t('enter_email')}
                        className='inputelem'
                        required={true}
                        ref={emailRef}
                      />
                      <span className='emailicon'>
                        <HiOutlineMail />
                      </span>
                    </Form.Group>
                    <Form.Group className='mb-3 position-relative d-inline-block w-100' controlId='formBasicPassword '>
                      <Form.Control
                        type={type}
                        placeholder={t('enter_password')}
                        className='inputelem'
                        required={true}
                        ref={passwordRef}
                      />
                      <span className='emailicon2'>
                        <FaLock />
                      </span>
                      <span onClick={handletoggle} className="password_icon">
                        {Icon}
                      </span>
                    </Form.Group>
                    <Form.Group className='mb-3 position-relative d-inline-block w-100' controlId='formBasicPassword' onChange={(e) => setConfPassword(e.target.value)} >
                      <Form.Control
                        type={type2}
                        placeholder={t('confirm_password')}
                        className='inputelem'
                        required={true}
                      />
                      <span className='emailicon2'>
                        <FaLock />
                      </span>
                      <span onClick={handletoggle2} className="password_icon">
                        {Icon2}
                      </span>
                    </Form.Group>
                    <div className='sign__up'>
                      <small className='text-center'>
                        <input type="checkbox" className='checkbox' name="agree" id="agree" required />
                        {t('user_agreement_msg')}&nbsp;
                        <u>
                          <Link className='conditions' href='/terms-conditions'>
                            {t('t&c')}
                          </Link>
                        </u>
                        &nbsp;&&nbsp;
                        <u>
                          <Link className='conditions' href='/privacy-policy'>
                            {t('privacy_policy')}
                          </Link>
                        </u>
                      </small>
                    </div>
                    <Button variant='primary w-100 my-3' className='submit_login' type='submit' disabled={loading}>
                      {loading ? t('please_wait') : `${t('create')} ${t('details')} `}
                    </Button>

                  </Form>}
                  <p className='text-center'>
                    {t('already_have_acc')}
                    <span>
                      <Link href={'/auth/login'} replace className='text-dark auth-signup'>
                        &nbsp;{t('login')}
                      </Link>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <NewUser profile={profile} setProfile={setProfile} />
        )}
      </div>
    </Layout>
  )
}
export default withTranslation()(SignUp)
