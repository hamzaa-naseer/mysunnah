'use client'
import React, { useEffect, useState } from 'react'
import ScrollToTop from 'src/components/Common/ScrollToTop'
import IntroSlider from 'src/components/Home/IntroSlider/IntroSlider'
import { getAndUpdateBookmarkData, isLogin } from 'src/utils'
import Features from 'src/components/Home/Features/Features'
import Process from 'src/components/Home/Process/Process'
import ChooseUs from 'src/components/Home/WhyChooseUs/ChooseUs'
import dynamic from 'next/dynamic'
import { useSelector } from 'react-redux'

const ArticlesSection = dynamic(() => import('src/components/Home/ArticlesSection'), { ssr: false })
const BooksSection = dynamic(() => import('src/components/Home/BooksSection'), { ssr: false })
import { selectHome } from 'src/store/reducers/homeSlice'
import noDataImage from '../../assets/images/no_data_found.svg'
import { t } from 'i18next'

const HomeComp = () => {
    // const selectcurrentLanguage = useSelector(selectCurrentLanguage)
    const selectHomeData = useSelector(selectHome)
    useEffect(() => {
        if (isLogin()) {
            getAndUpdateBookmarkData()
        }
    }, [])

    return (
        <main className='main'>
            {
                selectHomeData.data !== '102' ? <>
                    <IntroSlider homeSettings={selectHomeData?.data} isLoading={selectHomeData?.loading} />
                    <BooksSection />
                    <ArticlesSection />
                    {selectHomeData?.data?.section_1_mode === "1" ?
                        <ChooseUs homeSettings={selectHomeData?.data} isLoading={selectHomeData?.loading} />
                        : null}
                    {selectHomeData?.data?.section_2_mode === "1" ?
                        <Features homeSettings={selectHomeData?.data} isLoading={selectHomeData?.loading} />
                        : null}
                    {selectHomeData?.data?.section_3_mode === "1" ?
                        <Process homeSettings={selectHomeData?.data} isLoading={selectHomeData?.loading} />
                        : null}
                    <ScrollToTop />
                </> :
                    <div className="container no_data_found">
                        <img
                            className='no_data_found_image'
                            src={noDataImage.src}
                            alt='no data found'
                        />
                        <h3 className='d-flex justify-content-center pt-5'>{t("no_data_found")} </h3>
                    </div>

            }

        </main>
    )
}

export default HomeComp
