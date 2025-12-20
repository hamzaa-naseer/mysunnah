import { createSelector, createSlice } from '@reduxjs/toolkit'
import { getStripeSettingsApi } from 'src/utils/api'
import { apiCallBegan } from '../actions/apiActions'

// initial state
const initialState = {
  settings: {
    enabled: false,
    publishable_key: '',
    currency: 'gbp'
  },
  loading: false,
  lastFetch: null
}

// slice
export const stripeSlice = createSlice({
  name: 'Stripe',
  initialState,
  reducers: {
    stripeSettingsRequested: (stripe, action) => {
      stripe.loading = true
    },
    stripeSettingsSuccess: (stripe, action) => {
      const { data } = action.payload
      stripe.settings = {
        enabled: data?.stripe_enabled === '1' || false,
        publishable_key: data?.stripe_publishable_key || '',
        currency: data?.stripe_currency || 'gbp'
      }
      stripe.loading = false
      stripe.lastFetch = Date.now()
    },
    stripeSettingsFailure: (stripe, action) => {
      stripe.loading = false
    },
    clearStripeFlag: () => {
      sessionStorage.removeItem('firstLoad_Stripe')
    }
  }
})

export const {
  stripeSettingsRequested,
  stripeSettingsSuccess,
  stripeSettingsFailure,
  clearStripeFlag
} = stripeSlice.actions

export default stripeSlice.reducer

// API Calls
export const loadStripeSettings = ({
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {}
}) => {
  // Lazy import to avoid circular dependency
  const { store } = require("../store")
  
  const firstLoad = sessionStorage.getItem('firstLoad_Stripe')
  const manualRefresh = sessionStorage.getItem('manualRefresh_Stripe')

  const shouldFetchData = !firstLoad || manualRefresh === 'true'

  if (shouldFetchData) {
    store.dispatch(
      apiCallBegan({
        ...getStripeSettingsApi(),
        displayToast: false,
        onStartDispatch: stripeSettingsRequested.type,
        onSuccessDispatch: stripeSettingsSuccess.type,
        onErrorDispatch: stripeSettingsFailure.type,
        onStart,
        onSuccess: (res) => {
          sessionStorage.setItem('lastFetch_Stripe', Date.now())
          onSuccess(res)
        },
        onError
      })
    )

    sessionStorage.removeItem('manualRefresh_Stripe')
    sessionStorage.setItem('firstLoad_Stripe', 'true')
  } else {
    onSuccess(store.getState().Stripe)
  }
}

// Event listeners for manual refresh
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('manualRefresh_Stripe', 'true')
  })

  window.addEventListener('load', () => {
    if (!sessionStorage.getItem('lastFetch_Stripe')) {
      sessionStorage.setItem('manualRefresh_Stripe', 'true')
    }
  })
}

// Selectors
export const stripeSettingsData = createSelector(
  state => state.Stripe,
  stripe => stripe.settings
)

export const stripeLoadingState = createSelector(
  state => state.Stripe,
  stripe => stripe.loading
)
