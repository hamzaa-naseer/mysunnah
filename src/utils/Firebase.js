'use client'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { useSelector } from 'react-redux'
import { websettingsData } from 'src/store/reducers/webSettings'
import { getFirestore } from 'firebase/firestore'
import { useRouter } from 'next/router'
const FirebaseData = () => {
  const websettingsdata = useSelector(websettingsData)

  const firebaseConfig = {
    apiKey: websettingsdata?.firebase_api_key,
    authDomain: websettingsdata?.firebase_auth_domain,
    databaseURL: websettingsdata?.firebase_database_url,
    projectId: websettingsdata?.firebase_project_id,
    storageBucket: websettingsdata?.firebase_storage_bucket,
    messagingSenderId: websettingsdata?.firebase_messager_sender_id,
    appId: websettingsdata?.firebase_app_id,
    measurementId: websettingsdata?.firebase_measurement_id
  }
  let app
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApp()
  }
  const auth = getAuth(app)
  const db = getFirestore(app)
  return { auth, db, firebaseApp: app }
}
export default FirebaseData
