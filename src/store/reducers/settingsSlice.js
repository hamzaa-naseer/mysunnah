import { createSelector, createSlice } from '@reduxjs/toolkit'
import { getSettingsApi, getSystemConfigurationsApi } from 'src/utils/api'
import { apiCallBegan } from '../actions/apiActions'
import { store } from '../store'
import moment from 'moment'

// initial state
const initialState = {
  data: null,
  loading: false,
  lastFetch: null,
  syslastFetch: null,
  systemConfig: {} //immutable data
}

// slice
export const settingsSlice = createSlice({
  name: 'Settings',
  initialState,
  reducers: {
    settingsRequested: (settings, action) => {
      settings.loading = true
    },
    settingsSucess: (settings, action) => {
      settings.data = action.payload.data
      settings.loading = false
      settings.lastFetch = Date.now()
    },
    settingsFailure: (settings, action) => {
      settings.loading = false
    },
    settingsConfigurationSucess: (settings, action) => {
      let { data } = action.payload
      settings.systemConfig = data
      settings.loading = false
      settings.syslastFetch = Date.now()
    },
    clearReloadFlag: () => {
      sessionStorage.removeItem('firstLoad_Settings')
    }
  }
})

export const { settingsRequested, settingsSucess, settingsFailure, settingsConfigurationSucess, clearReloadFlag } =
  settingsSlice.actions
export default settingsSlice.reducer

// API Callls
export const settingsLoaded = ({ type = '', onSuccess = () => {}, onError = () => {}, onStart = () => {} }) => {
  const { lastFetch } = store.getState().Settings
  const diffInMinutes = moment().diff(moment(lastFetch), 'minutes')
  const firstLoad = sessionStorage.getItem('firstLoad_Settings')
  const manualRefresh = sessionStorage.getItem('manualRefresh_Settings')
  // If API data is fetched within last 10 minutes then don't call the API again
  const shouldFetchData = !firstLoad || manualRefresh === 'true'
  if (shouldFetchData) {
    store.dispatch(
      apiCallBegan({
        ...getSettingsApi(type),
        displayToast: false,
        onStartDispatch: settingsRequested.type,
        onSuccessDispatch: settingsSucess.type,
        onErrorDispatch: settingsFailure.type,
        onStart,
        onSuccess: res => {
          sessionStorage.setItem('lastFetch_Settings', Date.now())
        },
        onError
      })
    )
    // Clear manualRefresh flag
    sessionStorage.removeItem('manualRefresh_Settings')

    // Set firstLoad flag to prevent subsequent calls
    sessionStorage.setItem('firstLoad_Settings', 'true')
  } else {
    onSuccess(store.getState().Settings) // Invoke onSuccess with the existing data
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('manualRefresh_Settings', 'true')
  })

  window.addEventListener('load', () => {
    // Check if this is a manual refresh by checking if lastFetch is set
    if (!sessionStorage.getItem('lastFetch_Settings')) {
      sessionStorage.setItem('manualRefresh_Settings', 'true')
    }
  })
}

export const systemconfigApi = ({ onSuccess = () => {}, onError = () => {}, onStart = () => {} }) => {
  const firstLoad = sessionStorage.getItem('firstLoad_Settings_Config')
  const manualRefresh = sessionStorage.getItem('manualRefresh_Settings_Config')

  // Check if the data needs to be fetched
  const shouldFetchData = !firstLoad || manualRefresh === 'true'
  if (shouldFetchData) {
    store.dispatch(
      apiCallBegan({
        ...getSystemConfigurationsApi(),
        displayToast: false,
        onSuccessDispatch: settingsConfigurationSucess.type,
        onStart,
        onSuccess: res => {
          // onSuccess(res)
          sessionStorage.setItem('lastFetch_Settings_Config', Date.now())
        },
        onError: error => {
          onError(error)
        }
      })
    )
    // Clear manualRefresh flag
    sessionStorage.removeItem('manualRefresh_Settings_Config')

    // Set firstLoad flag to prevent subsequent calls
    sessionStorage.setItem('firstLoad_Settings_Config', 'true')
  } else {
    onSuccess(store.getState().Settings) // Invoke onSuccess with the existing data
  }
}

// Event listener to set manualRefresh flag when page is manually refreshed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('manualRefresh_Settings_Config', 'true')
  })

  window.addEventListener('load', () => {
    // Check if this is a manual refresh by checking if lastFetch is set
    if (!sessionStorage.getItem('lastFetch_Settings_Config')) {
      sessionStorage.setItem('manualRefresh_Settings_Config', 'true')
    }
  })
}

// selectors
export const settingsData = createSelector(
  state => state.Settings,
  Settings => Settings.data
)

export const sysConfigdata = createSelector(
  state => state.Settings,
  Settings => Settings.systemConfig
)
