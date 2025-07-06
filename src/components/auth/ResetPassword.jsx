"use client"
import React, { useRef, useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { FaEnvelope } from 'react-icons/fa'
import { HiOutlineMail } from "react-icons/hi";
import toast from 'react-hot-toast'
import { withTranslation } from 'react-i18next'
import FirebaseData from 'src/utils/Firebase'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { t } from 'i18next'
import { sendPasswordResetEmail } from 'firebase/auth'
import { IoMdArrowRoundBack } from 'react-icons/io'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })

const ResetPassword = () => {

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const emailRef = useRef()

  const { auth } = FirebaseData()

  // auth password reset
  const passwordReset = async email => {
    let promise = await new Promise(function (resolve, reject) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          resolve(`Password Reset Email sent to ${email}`)
        })
        .catch(error => {
          reject(error)
        })
    })

    return promise
  }

  // calling auth password reset
  const handlePasswordReset = e => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const email = emailRef.current.value
    passwordReset(email)
      .then(msg => {
        setMessage(msg)
        setLoading(false)
      })
      .catch(error => {
        toast.error(error.message)
        setLoading(false)
      })
  }

  return (
    <Layout>
      <div className='ResetPassword wrapper loginform mt-5'>
        <div className='custom-container glassmorcontain'>
          <div className='row morphisam'>
            <div className='col-12 border-line position-relative'>
              <div className='inner__login__form outerline p-5'>
                <h3 className='mb-4 Otp_Verification_title'>{t('forgot_pass')}?</h3>
                <p>{t('send_link_to_get_account')}</p>

                <Form onSubmit={e => handlePasswordReset(e)}>
                  <Form.Group className='mb-3 position-relative d-inline-block w-100 mt-3' controlId='formBasicEmail'>
                    <Form.Control
                      type='email'
                      placeholder={t('enter_email')}
                      className='inputelem'
                      ref={emailRef}
                      required={true}
                    />
                    <span className='emailicon'>
                    <HiOutlineMail />
                    </span>
                  </Form.Group>
                  <Button variant='primary w-100 mb-3' className='email_send' type='submit' disabled={loading}>
                    {loading ? t('please_wait') : t('send')}
                  </Button>
                  {message && <p>{message}</p>}
                  <div className='sign__up'>
                    <p className=''>
                      <span >
                        <Link className='text-decoration-none font-light' href={'/auth/login'}> <IoMdArrowRoundBack /> {t('back_to_login')}</Link>
                      </span>
                    </p>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withTranslation()(ResetPassword)
