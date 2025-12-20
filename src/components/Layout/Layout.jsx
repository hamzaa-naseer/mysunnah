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

const LayoutContent = ({ children }) => {
  const { i18n } = useTranslation()
  const navigate = useRouter()
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(false)

  // Use the actual selectors
  const selectcurrentLanguage = useSelector(selectCurrentLanguage)
  const webSettings = useSelector(websettingsData)
  // const selectcurrentLanguage = { id: 1, code: 'en' }
  // const webSettings = {}

  const dispatch = useDispatch();
  // const dispatch = () => { }

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

    dispatch(LoadWebSettingsDataApi(
      () => { setLoading(false); },
      () => { }
    ))

    systemconfigApi({
      onSuccess: () => { setLoading(false); },
      onError: (error) => {
        setLoading(false);
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
    const primaryColor = webSettings && webSettings?.primary_color ? webSettings?.primary_color : "#EF5388FF";
    const secondaryColor = webSettings && webSettings?.footer_color ? webSettings?.footer_color : "#090029FF";

    document.documentElement.style.setProperty('--primary-color', primaryColor)
    document.documentElement.style.setProperty('--secondary-color', secondaryColor)

    // Set RGB values for transparency usage
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.substring(0, 7));
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    };

    const primaryRgb = hexToRgb(primaryColor);
    if (primaryRgb) {
      document.documentElement.style.setProperty('--primary-rgb', primaryRgb);
    }
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

// Wrapper component that handles the mounting state
const Layout = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted on client side
  if (!mounted) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <RiseLoader color="#ef5488" size={25} />
      </div>
    );
  }

  return <LayoutContent>{children}</LayoutContent>;
};

export default Layout
