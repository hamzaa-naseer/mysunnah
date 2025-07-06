'use client'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadWebSettingsDataApi, websettingsData } from 'src/store/reducers/webSettings'
import { settingsLoaded, sysConfigdata, systemconfigApi } from "src/store/reducers/settingsSlice";
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentLanguage } from 'src/store/reducers/languageSlice'
import { RiseLoader } from 'react-spinners'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Suspense } from 'react';
import Meta from '../SEO/Meta';
import { homeUpdateLanguage, loadHome } from 'src/store/reducers/homeSlice';
// import ErrorBoundary from '../HandleError/ErrorBoundary ';
const TopHeader = dynamic(() => import('../NavBar/TopHeader'), { ssr: false })
const Header = dynamic(() => import('./Header'), { ssr: false })
const Footer = dynamic(() => import('./Footer'), { ssr: false })
// const Notification = dynamic(() => import('../FirebaseNotification/Notification'), { ssr: false })

const Layout = ({ children }) => {

  const { i18n } = useTranslation()

  const navigate = useRouter()

  const [loading, setLoading] = useState(true);

  const [redirect, setRedirect] = useState(false)


  const selectcurrentLanguage = useSelector(selectCurrentLanguage)

  const webSettings = useSelector(websettingsData)

  const dispatch = useDispatch();

  useEffect(() => {
    loadHome({
      onSuccess: response => {
        dispatch(homeUpdateLanguage(selectcurrentLanguage.id))
      },
      onError: error => {
        dispatch(homeUpdateLanguage(""))
        console.log(error)
      }
    })

  }, [selectcurrentLanguage])

  // all settings data
  useEffect(() => {

    settingsLoaded({ type: "" })

    LoadWebSettingsDataApi(
      () => { setLoading(false); },
      () => { }
    )

    systemconfigApi({
      onSuccess: () => { setLoading(false); },
      onError: (error) => {
        console.log(error)
      }
    })

    i18n.changeLanguage(selectcurrentLanguage.code)

  }, [])



  // Maintainance Mode
  const getsysData = useSelector(sysConfigdata)

  useEffect(() => {
    if (getsysData && getsysData.app_maintenance === '1') {
      setRedirect(true)
    } else {
      setRedirect(false)
    }
  }, [getsysData?.app_maintenance])

  // loader
  const loaderstyles = {
    loader: {
      textAlign: 'center',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    },
    img: {
      maxWidth: '100%',
      maxHeight: '100%'
    }
  }

  // Function to handle navigation to maintenance page
  const handleMaintenanceRedirect = () => {
    navigate.push('/maintenance')
  }

  useEffect(() => {
    if (redirect) {
      handleMaintenanceRedirect() // Trigger the navigation outside the JSX
    }
  }, [redirect])

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', webSettings && webSettings?.primary_color ? webSettings && webSettings?.primary_color : "#EF5388FF")
    document.documentElement.style.setProperty('--secondary-color', webSettings && webSettings?.footer_color ? webSettings?.footer_color : "#090029FF")
  }, [webSettings])

  return (
    <>

      {loading ? (
        <Suspense fallback>
          <div className='loader' style={loaderstyles.loader}>
            <RiseLoader className='inner_loader' style={loaderstyles.img} />
          </div>
        </Suspense>
      ) : (
        <>
          {/* <ErrorBoundary> */}
          <Meta />
          <TopHeader />
          <Header />
          {children}
          <Footer />
          {/* </ErrorBoundary> */}
        </>

      )}

    </>
  )
}
export default Layout
