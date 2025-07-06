import { createSelector, createSlice } from '@reduxjs/toolkit'
import { getWebSettingsApi } from 'src/utils/api'
import { apiCallBegan } from '../actions/apiActions'
import { store } from '../store'

// state
const initialState = {
  data: [],
  loading: false,
  lastFetch: null
}

// slice
export const userSlice = createSlice({
  name: 'WebSettings',
  initialState,
  reducers: {
    webSettingsRequested: (web, action) => {
      web.loading = true
    },
    webSettingsSuccess: (web, action) => {
      let { data } = action.payload
      web.data = data
      web.loading = false
      web.lastFetch = Date.now()
    },
    webSettingsFailed: (web, action) => {
      web.loading = false
    }
  }
})

export const { webSettingsRequested, webSettingsSuccess, webSettingsFailed } = userSlice.actions
export default userSlice.reducer

// selectors
export const selectUser = state => state.User

// update name and mobile
export const LoadWebSettingsDataApi = (onSuccess, onError, onStart) => {
  const firstLoad = sessionStorage.getItem('firstLoad_WebSettings_Config')
  const manualRefresh = sessionStorage.getItem('manualRefresh_WebSettings_Config')
  const shouldFetchData = !firstLoad || manualRefresh === 'true'
  if (shouldFetchData) {
    store.dispatch(
      apiCallBegan({
        ...getWebSettingsApi(),
        displayToast: false,
        onStartDispatch: webSettingsRequested.type,
        onSuccessDispatch: webSettingsSuccess.type,
        onErrorDispatch: webSettingsFailed.type,
        onStart,
        onSuccess,
        onError
      })
    )
    // Clear manualRefresh flag
    sessionStorage.removeItem('manualRefresh_WebSettings_Config')

    // Set firstLoad flag to prevent subsequent calls
    sessionStorage.setItem('firstLoad_WebSettings_Config', 'true')
  } else {
    onSuccess(store.getState().WebSettings) // Invoke onSuccess with the existing data
  }
}

// Event listener to set manualRefresh flag when page is manually refreshed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('manualRefresh_WebSettings_Config', 'true')
  })

  window.addEventListener('load', () => {
    // Check if this is a manual refresh by checking if lastFetch is set
    if (!sessionStorage.getItem('lastFetch_WebSettings_Config')) {
      sessionStorage.setItem('manualRefresh_WebSettings_Config', 'true')
    }
  })
}

// Selector Functions
export const websettingsData = createSelector(
  state => state.WebSettings,
  WebSettings => WebSettings?.data
)
