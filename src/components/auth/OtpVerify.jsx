
"use client"
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { register } from 'src/store/reducers/userSlice.js'
import FirebaseData from 'src/utils/Firebase.js'
import 'swiper/css/effect-fade'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NewUser from 'src/components/Common/NewUser.jsx'
import OtpInput from 'react-otp-input';
import { t } from 'i18next'
import { withTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'
import { RecaptchaVerifier, getAdditionalUserInfo, signInWithPhoneNumber } from 'firebase/auth'
import { IoMdArrowRoundBack } from "react-icons/io";
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })

const OtpVerify = () => {

    const [phoneNumber, setPhoneNumber] = useState('')
    const [confirmResult, setConfirmResult] = useState('')
    const [otp, setOtp] = useState('');
    const [isSend, setIsSend] = useState(false)
    const [newUserScreen, setNewUserScreen] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [isCounting, setIsCounting] = useState(false)
    const [profile, setProfile] = useState({
        name: '',
        mobile: '',
        email: '',
        profile: '',
        all_time_rank: '',
        all_time_score: '',
        coins: '',
        friends_code: '',

    })

    const [load, setLoad] = useState(false)
    const router = useRouter()

    const { auth, firebase } = FirebaseData()
    // window recaptcha
    useEffect(() => {
        setTimeout(() => {
            const recaptchaContainer = document.getElementById('recaptcha-container');

            if (recaptchaContainer) {
                recaptchaContainer.innerHTML = ''; // Clear the container

                window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
                    size: 'invisible',
                    // other options
                });

                return () => {
                    window.recaptchaVerifier.clear();
                };
            } else {
                console.error("Error: Could not find the recaptcha-container element in the DOM.");
            }
        }, 1000)


    }, [firebase]);

    // Load the libphonenumber library
    const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

    // Validate a phone number
    const validatePhoneNumber = phone_number => {
        try {
            const parsedNumber = phoneUtil.parse(phone_number)
            return phoneUtil.isValidNumber(parsedNumber)
        } catch (err) {
            return false
        }
    }

    // otp sigin with phone number
    const onSubmit = e => {
        e.preventDefault()
        setLoad(true)
        let phone_number = '+' + phoneNumber
        try {


            if (validatePhoneNumber(phone_number)) {
                const appVerifier = window.recaptchaVerifier
                signInWithPhoneNumber(auth, phone_number, appVerifier)
                    .then(response => {
                        // success
                        setIsSend(true)
                        setLoad(false)
                        setConfirmResult(response)
                    })
                    .catch(error => {
                        // window.recaptchaVerifier.render().then(function (widgetId) {
                        //     window.recaptchaVerifier.reset(widgetId)
                        // })
                        if (error.code == 'auth/too-many-requests') {
                            router.push('/')
                            toast.error("please try after some time latter")
                        } else {
                            console.log(error)
                            handleVerificationError(error)
                            setLoad(false)
                        }
                    })
            } else {
                setLoad(false)
                toast.error(t('enter_num_with_country_code'))
            }
        } catch (error) {
            console.log(error);
        }
        setSeconds(60)
        setIsCounting(true)
    }
    useEffect(() => {

    }, [onSubmit])
    useEffect(() => {
        let timer;
        if (isCounting && seconds > 0) {
            timer = setInterval(() => {
                setSeconds((prevSeconds) => prevSeconds - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsCounting(false);
        }
        return () => clearInterval(timer);
    }, [isCounting, seconds]);

    // resend otp
    const resendOtp = e => {
        e.preventDefault()
        setLoad(true)
        let phone_number = '+' + phoneNumber
        const appVerifier = window.recaptchaVerifier
        signInWithPhoneNumber(auth, phone_number, appVerifier)
            .then(response => {
                setIsSend(true)
                setLoad(false)
                setConfirmResult(response)
                toast.success(t('otp_sent'))
            })
            .catch(error => {
                // window.recaptchaVerifier.render().then(function (widgetId) {
                //     window.recaptchaVerifier.reset(widgetId)
                // })
                handleVerificationError(error)
                toast.error(error.message)
                setLoad(false)
            })
        setSeconds(60)
        setIsCounting(true)
    }

    // verify code
    const handleVerifyCode = e => {
        e.preventDefault()
        setLoad(true)
        if (confirmResult) { // Check if confirmResult is not null
            confirmResult.confirm(otp)
                .then(response => {
                    setLoad(false)
                    setProfile(response.user)
                    let firebase_id = response.user.uid

                    let phone = response.user.phoneNumber
                    let image_url = response.user.photoURL
                    let email = response.user.email
                    let name = response.user.displayName
                    let fcm_id = null
                    let friends_code = null
                    const { isNewUser } = getAdditionalUserInfo(response)
                    register(
                        firebase_id,
                        'mobile',
                        name,
                        email,
                        image_url,
                        phone,
                        fcm_id,
                        friends_code,
                        success => {
                            toast.success(t('successfully_login'))
                            if (isNewUser) {
                                //If new User then show the Update Profile Screen
                                setNewUserScreen(true)
                            } else {
                                router.push('/quiz-play')
                            }
                        },
                        error => {
                            if (error === "126") {
                                toast.error(t("ac_deactive"));
                            }else{
                                toast.error(`${t('Please ')}${t('try_again')}`);
                                console.log("handleVerifyCode" ,error);
                                
                            }
                        }
                    )
                })
                .catch(error => {
                    handleVerificationError(error);
                    setLoad(false)
                })
                .finally(() => {
                    setLoad(false);
                });
        } else {
            setLoad(false);
            toast.error('Confirmation result is null. Please try again.');
        }
    }

    const handleVerificationError = error => {
        switch (error.code) {
            case 'auth/invalid-verification-code':
                toast.error('Invalid verification code. Please double-check the code entered.');
                break;
            case 'auth/missing-verification-code':
                toast.error('Verification code is missing.');
                break;
            case 'auth/code-expired':
                toast.error('Verification code has expired. Request a new code.');
                break;
            case 'auth/invalid-verification-id':
                toast.error('Invalid verification ID. Please retry the verification process.');
                break;
            case 'auth/user-disabled':
                toast.error('The user account has been disabled.');
                break;
            case 'auth/quota-exceeded':
                toast.error('Quota for verification attempts exceeded. Please try again later.');
                break;
            case 'auth/captcha-check-failed':
                toast.error('reCAPTCHA verification failed. Check your reCAPTCHA configuration.');
                break;
            case 'auth/invalid-phone-number':
                toast.error('Invalid phone number. Double-check the phone number format.');
                break;
            case 'auth/app-not-authorized':
                toast.error('Firebase app not authorized. Check Firebase configuration.');
                break;
            case 'auth/invalid-credential':
                toast.error('Invalid credential. Double-check the authentication credential.');
                break;
            case 'auth/credential-already-in-use':
                toast.error('Credential (phone number) is already in use.');
                break;
            case 'auth/unverified-email':
                toast.error('User account has an unverified email. Verify the email first.');
                break;
            default:
                toast.error('Error: ' + error.message);
        }
    };

    // change phone number
    const onChangePhoneNumber = e => {
        e.preventDefault()
        setOtp('')
        setConfirmResult(null)
        setIsSend(false)
    }

    return (
        <Layout>
            <div className='otpverify wrapper loginform mt-5'>
                {!newUserScreen ? (
                    <div className='custom-container glassmorcontain'>
                        <div className='row morphisam adj_width'>
                            <div className='col-12 border-line position-relative Otp_Verification'>
                                <div className='inner__login__form outerline'>
                                    {!isSend ? (
                                        <form className='form text-start' onSubmit={onSubmit}>
                                            <h3 className='mb-4  text-left Otp_Verification_title'>{t('sign_mobile')}</h3>
                                            <div>
                                                <label htmlFor='number' className='mb-2 paddingRight'>
                                                    {t('digit_code')}
                                                </label>
                                                <PhoneInput
                                                    value={phoneNumber}
                                                    country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
                                                    countryCodeEditable={false}
                                                    autoFocus={true}
                                                    onChange={phone => setPhoneNumber(phone)}
                                                    className=' position-relative d-inline-block w-100 form-control my-3'
                                                />
                                                <div className='Otp_Verification_title'>
                                                    <button className='btn btn-primary' type='submit'>
                                                        {!load ? t('req_otp') : t('please_wait')}
                                                    </button>

                                                </div>
                                                <div className='Otp_Verification_title'>
                                                    <Link className='btn backlogin' href={'/auth/login'} type='button'>
                                                        <IoMdArrowRoundBack /> {t('Back_to_login')}
                                                    </Link>
                                                </div>
                                            </div>
                                        </form>
                                    ) : null}
                                    {isSend ? (
                                        <form className='form text-start sent_otp' onSubmit={handleVerifyCode}>
                                            <h3 className='mb-4  text-left Otp_Verification_title'>{t("otp_Verification")}</h3>
                                            <div className='form'>

                                                <label htmlFor='code' className='Otp_Verification_title paddingRight'>
                                                    {t("send_code")} +{phoneNumber}
                                                </label>
                                                <OtpInput
                                                    value={otp}
                                                    onChange={setOtp}
                                                    numInputs={6}
                                                    containerStyle={"otpbox"}
                                                    renderSeparator={<span className='space'></span>}
                                                    renderInput={(props) => <input {...props} className="custom-input-class"></input>}
                                                />

                                                <div className='text-center resend_otp my-2'>
                                                    {seconds == 0 ? <div className='hide_resend_otp'> <p>{t("didnt_get")}</p>
                                                        <Link className='main-color' href='#' onClick={resendOtp}>
                                                            {t('otp_resend')}
                                                        </Link>
                                                    </div> : <p> {t('please_wait')} {seconds}</p>}
                                                </div>
                                                <div className='Otp_Verification_title'>

                                                    <button className='btn btn-primary' type='submit'>
                                                        {!load ? t('submit') : t('please_wait')}
                                                    </button>

                                                </div>
                                                <div className='Otp_Verification_title'>
                                                    <button type='button' className='btn ' onClick={onChangePhoneNumber}>
                                                        <IoMdArrowRoundBack />  {t("Back_to_login")}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                        <div id='recaptcha-container'></div>
                    </div>
                ) : (
                    <>
                        <NewUser profile={profile} setProfile={setProfile} />
                    </>
                )}
            </div>
        </Layout>
    )
}

export default withTranslation()(OtpVerify)