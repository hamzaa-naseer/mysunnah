// userCoinsSlice.js
import { createSelector, createSlice } from '@reduxjs/toolkit'
import { store } from '../store'
import { apiCallBegan } from '../actions/apiActions'
import moment from 'moment'
import { getUserCoinsApi } from 'src/utils/api'

const initialState = {
  data: null,
  lastFetch: null,
  loading: false
}

export const userCoinsSlice = createSlice({
  name: 'UserCoins',
  initialState,
  reducers: {
    userCoinsRequested: (usercoins, action) => {
      usercoins.loading = true
    },
    userCoinsSuccess: (usercoins, action) => {
      usercoins.data = action.payload.data
      usercoins.loading = false
      usercoins.lastFetch = Date.now()
    },
    userCoinsFailure: (usercoins, action) => {
      usercoins.loading = false
    },
    clearReloadFlag: () => {
      sessionStorage.removeItem('firstLoad_Coins')
    }
  }
})

export const { userCoinsRequested, userCoinsSuccess, userCoinsFailure, clearReloadFlag } = userCoinsSlice.actions
export default userCoinsSlice.reducer

// API CALLS
export const loadUserCoinApi = ({ onSuccess = () => {}, onError = () => {}, onStart = () => {} }) => {
  const firstLoad = sessionStorage.getItem('firstLoad_Coins')
  const manualRefresh = sessionStorage.getItem('coin_ManualRefresh')

  // Check if the data needs to be fetched
  const shouldFetchData = !firstLoad || manualRefresh === 'true'
  // if (shouldFetchData) {
    store.dispatch(
      apiCallBegan({
        ...getUserCoinsApi(),
        displayToast: false,
        onStartDispatch: userCoinsRequested.type,
        onSuccessDispatch: userCoinsSuccess.type,
        onErrorDispatch: userCoinsFailure.type,
        onStart,
        onSuccess: res => {
          onSuccess(res)
          // sessionStorage.setItem('lastFetch_Coins', Date.now())
        },
        onError: error => {
          onError(error)
        }
      })
    )

    // // Clear manualRefresh flag
    // sessionStorage.removeItem('coin_ManualRefresh')

    // // Set firstLoad flag to prevent subsequent calls
    // sessionStorage.setItem('firstLoad_Coins', 'true')
  // }
  //  else {
    // onSuccess(store.getState().UserCoins) // Invoke onSuccess with the existing data
  // }
}

// Event listener to set manualRefresh flag when page is manually refreshed
// if (typeof window !== 'undefined') {
//   window.addEventListener('beforeunload', () => {
//     sessionStorage.setItem('coin_ManualRefresh', 'true')
//   })

//   window.addEventListener('load', () => {
//     // Check if this is a manual refresh by checking if lastFetch is set
//     if (!sessionStorage.getItem('lastFetch_Coins')) {
//       sessionStorage.setItem('coin_ManualRefresh', 'true')
//     }
//   })
// }

// Selectors
export const userCoinsData = createSelector(
  state => state.UserCoins,
  usercoins => usercoins?.data
)
