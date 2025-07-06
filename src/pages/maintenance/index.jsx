'use client'
import React, { Fragment } from 'react'
import { withTranslation } from 'react-i18next'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import dynamic from 'next/dynamic'
import Meta from 'src/components/SEO/Meta'
import maintainenceimg from "src/assets/images/maintenance.svg"
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })

const Maintainance = ({ t }) => {
  return (
    <>
      <Meta />
      <Layout>
        <Breadcrumb title={t('maintainance')} content="" contentTwo="" />
        <div className='Maintainance'>
          <div className='container'>
            <div className='row'>
              <div className='col-md-8 col-12 mx-auto'>
                <div className='morphisam'>
                  <div className='left_image'>
                    <img src={maintainenceimg.src} className='maintain_img' title='maintainance' />
                  </div>
                  <div className='right_text'>
                    <p>
                      {t('sry_for_maintenance')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default withTranslation()(Maintainance)
