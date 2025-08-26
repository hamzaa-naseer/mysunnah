import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadStripeSettings } from 'src/store/reducers/stripeSlice'

const StripeProvider = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Load Stripe settings on app initialization
    loadStripeSettings({
      onSuccess: (response) => {
        console.log('Stripe settings loaded successfully')
      },
      onError: (error) => {
        console.warn('Failed to load Stripe settings from backend, using environment variables:', error)
      }
    })
  }, [])

  return children
}

export default StripeProvider
