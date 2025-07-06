"use client"
import React from 'react'
import { withTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { useSelector } from 'react-redux'
import purify from 'dompurify'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { settingsData } from 'src/store/reducers/settingsSlice'
import dynamic from 'next/dynamic'
import { t } from 'i18next'
const Layout = dynamic(() => import('../Layout/Layout'), { ssr: false })

const Instructions = () => {
    const selectdata = useSelector(settingsData)

    const appdata = selectdata && selectdata.filter(item => item.type === 'instructions')
    const data = appdata && appdata[0]?.message
    return (
        <Layout>
            <Breadcrumb title={t('instruction')} content="" contentTwo="" />
            <div className='Instruction'>
                <div className='container'>

                    <div className='row morphisam'>
                        {data ? (
                            // Check if data is not empty after sanitization
                            purify.sanitize(data) !== '' ? (
                                <div className='col-12' dangerouslySetInnerHTML={{ __html: purify.sanitize(data) }}></div>
                            ) : (
                                <p>{t("no_data_found")}</p>
                            )
                        ) : (
                            <div className='text-center text-white'>
                                <Skeleton count={5} />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default withTranslation()(Instructions)
