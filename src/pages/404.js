'use client'
import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { withTranslation } from 'react-i18next'
import Link from 'next/link'
import img404 from '../assets/images/404.svg'
import Meta from 'src/components/SEO/Meta'
import Layout from 'src/components/Layout/Layout'

const NotFound = ({ t }) => {
  return (
    <>
      <Meta />
      <Layout>
        {/* <Breadcrumb title={t('404')} content="" contentTwo="" /> */}
        <div className='error_page morphisam'>
          <div className='image_error'>
            <img src={img404.src} alt='404' />
          </div>

          <div className='error_button mt-4'>
            <Link href='/' className='btn btn-primary'>
              <i>
                <FaArrowLeft />
              </i>{' '}
              {t('back')}
            </Link>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default withTranslation()(NotFound)
