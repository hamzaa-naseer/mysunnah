"use client"
import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { useSelector, useDispatch } from 'react-redux'
import { t } from 'i18next'
import toast from 'react-hot-toast'
import { Modal, Spin } from 'antd'
import {
  createStripePaymentIntent,
  confirmStripePayment,
  getStripeCoinPackages,
  getusercoinsApi
} from 'src/store/actions/campaign'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { loadStripeSettings, stripeSettingsData } from 'src/store/reducers/stripeSlice'
import coinimg from "src/assets/images/coin.svg"

// Initialize Stripe with dynamic key
let stripePromise = null

const initializeStripe = (publishableKey) => {
  if (!publishableKey || publishableKey === 'pk_test_...' || publishableKey === 'pk_live_...') {
    console.warn('Stripe publishable key not configured properly')
    return null
  }

  try {
    return loadStripe(publishableKey)
  } catch (error) {
    console.error('Failed to initialize Stripe:', error)
    return null
  }
}

const PaymentForm = ({ selectedPackage, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')

  useEffect(() => {
    if (selectedPackage) {
      createPaymentIntent()
    }
  }, [selectedPackage])

  const createPaymentIntent = () => {
    if (!selectedPackage) return

    setLoading(true)
    console.log('Creating payment intent for package:', selectedPackage)

    createStripePaymentIntent({
      amount: selectedPackage.amount,
      coins: selectedPackage.coins,
      onSuccess: (response) => {
        console.log('Payment intent response:', response)

        // Handle multiple possible response structures
        let clientSecret = null
        let paymentIntentId = null

        if (response && !response.error) {
          // Try different response structures based on backend implementation
          if (response.data) {
            clientSecret = response.data.client_secret || response.data.clientSecret
            paymentIntentId = response.data.payment_intent_id || response.data.paymentIntentId || response.data.id
          } else {
            clientSecret = response.client_secret || response.clientSecret
            paymentIntentId = response.payment_intent_id || response.paymentIntentId || response.id
          }

          console.log('Extracted client secret:', clientSecret)
          console.log('Extracted payment intent ID:', paymentIntentId)
          console.log('Full response for debugging:', JSON.stringify(response, null, 2))

          if (clientSecret && typeof clientSecret === 'string' && clientSecret.trim() !== '' && clientSecret.includes('_secret_')) {
            setClientSecret(clientSecret)
            setPaymentIntentId(paymentIntentId)
            console.log('Client secret set successfully:', clientSecret)
          } else {
            console.error('Invalid client secret received:', clientSecret)
            console.error('Client secret type:', typeof clientSecret)
            console.error('Client secret length:', clientSecret ? clientSecret.length : 0)
            console.error('Full response:', JSON.stringify(response, null, 2))
            toast.error(t('invalid_payment_intent') + ': Client secret is invalid or missing')
          }
        } else {
          console.error('Payment intent creation failed:', response)
          toast.error(response?.message || t('payment_creation_failed'))
        }
        setLoading(false)
      },
      onError: (error) => {
        console.error('Payment intent creation failed:', error)
        toast.error(t('payment_creation_failed'))
        setLoading(false)
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      console.error('Stripe not loaded or elements not available')
      toast.error(t('stripe_not_ready'))
      return
    }

    if (!clientSecret || !clientSecret.includes('_secret_')) {
      console.error('Invalid or missing client secret:', clientSecret)
      toast.error(t('payment_not_ready'))
      return
    }

    setLoading(true)
    console.log('Confirming payment with client secret:', clientSecret)

    const cardElement = elements.getElement(CardElement)

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'MySunnah User',
          },
        },
      })

      if (error) {
        console.error('Payment confirmation error:', error)
        toast.error(error.message)
        setLoading(false)
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent)
        // Confirm payment with backend
        confirmStripePayment({
          payment_intent_id: paymentIntentId,
          onSuccess: (response) => {
            if (!response.error) {
              toast.success(response.message)
              // Refresh user coins
              getusercoinsApi({
                onSuccess: (coinsResponse) => {
                  updateUserDataInfo(coinsResponse.data)
                },
                onError: (error) => {
                  console.log(error)
                }
              })
              onSuccess()
            } else {
              toast.error(response.message)
            }
            setLoading(false)
          },
          onError: (error) => {
            console.error('Payment confirmation failed:', error)
            toast.error(t('payment_confirmation_failed'))
            setLoading(false)
          }
        })
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      toast.error(t('payment_processing_failed'))
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <div className="stripe-payment-form professional-payment-form">
      <div className="payment-header">
        <div className="selected-package-summary">
          <div className="package-info">
            <h4 className="package-title">{selectedPackage?.title}</h4>
            <p className="package-desc">{selectedPackage?.description}</p>
          </div>
          <div className="payment-summary">
            <div className="summary-row">
              <span className="summary-label">Coins:</span>
              <div className="coins-display">
                <img src={coinimg.src} alt="coin" className="coin-icon-small" />
                <span className="coins-value">{selectedPackage?.coins}</span>
              </div>
            </div>
            <div className="summary-row total-row">
              <span className="summary-label">Total:</span>
              <span className="total-amount">£{selectedPackage?.amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form professional-form">
        <div className="form-section">
          <h5 className="section-title">
            <i className="fas fa-credit-card"></i>
            Card Details
          </h5>

          <div className="card-input-wrapper">
            <div className="card-element-container professional-card-input">
              <label className="input-label">Card Information</label>
              <div className="card-element-inner">
                <CardElement options={cardElementOptions} />
              </div>
              <div className="card-icons">
                <i className="fab fa-cc-visa"></i>
                <i className="fab fa-cc-mastercard"></i>
                <i className="fab fa-cc-amex"></i>
                <i className="fab fa-cc-discover"></i>
              </div>
            </div>
          </div>

          <div className="security-info">
            <div className="security-item">
              <i className="fas fa-lock"></i>
              <span>Your payment information is encrypted and secure</span>
            </div>
            <div className="security-item">
              <i className="fas fa-shield-alt"></i>
              <span>Protected by Stripe's advanced fraud detection</span>
            </div>
          </div>
        </div>

        <div className="payment-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-cancel"
            disabled={loading}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Packages
          </button>

          <button
            type="submit"
            disabled={!stripe || loading || !clientSecret}
            className="btn btn-pay"
          >
            {loading ? (
              <>
                <Spin size="small" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <i className="fas fa-credit-card"></i>
                <span>Pay £{selectedPackage?.amount?.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>

        {!clientSecret && !loading && (
          <div className="payment-status preparing">
            <i className="fas fa-hourglass-half"></i>
            <span>Preparing payment...</span>
          </div>
        )}
      </form>

      <div className="payment-footer">
        <div className="refund-policy">
          <p>
            <i className="fas fa-info-circle"></i>
            Coins will be added to your account immediately after successful payment.
          </p>
        </div>
      </div>
    </div>
  )
}

const StripePayment = ({ isOpen, onClose }) => {
  const [packages, setPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stripeReady, setStripeReady] = useState(false)

  // Get Stripe settings from backend
  const stripeSettings = useSelector(stripeSettingsData)

  // Initialize Stripe when settings are loaded
  useEffect(() => {
    if (stripeSettings?.enabled && stripeSettings?.publishable_key) {
      stripePromise = initializeStripe(stripeSettings.publishable_key)
      setStripeReady(!!stripePromise)
    } else {
      // Try environment variable as fallback
      const envKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (envKey && envKey !== 'pk_test_...' && envKey !== 'pk_live_...') {
        stripePromise = initializeStripe(envKey)
        setStripeReady(!!stripePromise)
      } else {
        setStripeReady(false)
      }
    }
  }, [stripeSettings])

  // Load Stripe settings when component opens
  useEffect(() => {
    if (isOpen) {
      loadStripeSettings({
        onSuccess: (response) => {
          // Settings loaded, stripeReady will be set by the above useEffect
        },
        onError: (error) => {
          console.error('Failed to load Stripe settings:', error)
          // Try to use environment variable as fallback
          const envKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
          if (envKey && envKey !== 'pk_test_...' && envKey !== 'pk_live_...') {
            stripePromise = initializeStripe(envKey)
            setStripeReady(!!stripePromise)
          }
        }
      })
    }
  }, [isOpen])

  // Check if Stripe is enabled and properly configured
  useEffect(() => {
    if (isOpen && !stripeReady) {
      toast.error(t('stripe_not_configured'))
      onClose()
    }
  }, [isOpen, stripeReady, onClose])

  useEffect(() => {
    if (isOpen && stripeReady) {
      loadCoinPackages()
    }
  }, [isOpen, stripeReady])

  const loadCoinPackages = () => {
    setLoading(true)
    getStripeCoinPackages({
      onSuccess: (response) => {
        if (!response.error && response.data) {
          // Create standard packages if no backend packages exist
          const backendPackages = response.data

          if (!Array.isArray(backendPackages) || backendPackages.length === 0) {
            // Elite Quiz Stripe packages with exact specifications
            const standardPackages = [
              {
                id: 1,
                title: '10 Coins',
                subtitle: 'Perfect Start',
                coins: 10,
                amount: 1.00,
                currency: 'GBP',
                description: 'Buy 10 coins for £1.00',
                popular: false,
                recommended: false,
                badge: 'Perfect Start'
              },
              {
                id: 2,
                title: '50 Coins',
                subtitle: 'Popular Choice',
                coins: 50,
                amount: 5.00,
                currency: 'GBP',
                description: 'Buy 50 coins for £5.00',
                popular: true,
                recommended: true,
                badge: 'Most Popular'
              },
              {
                id: 3,
                title: '100 Coins',
                subtitle: 'Best Value!',
                coins: 100,
                amount: 10.00,
                currency: 'GBP',
                description: 'Buy 100 coins for £10.00',
                popular: false,
                recommended: false,
                badge: 'Great Value'
              },
              {
                id: 4,
                title: '250 Coins',
                subtitle: 'Best Value!',
                coins: 250,
                amount: 25.00,
                currency: 'GBP',
                description: 'Buy 250 coins for £25.00',
                popular: false,
                recommended: false,
                badge: 'Great Value'
              },
              {
                id: 5,
                title: '500 Coins',
                subtitle: 'Best Value!',
                coins: 500,
                amount: 50.00,
                currency: 'GBP',
                description: 'Buy 500 coins for £50.00',
                popular: false,
                recommended: false,
                badge: 'Great Value'
              }
            ]
            setPackages(standardPackages)
          } else {
            // Transform backend packages to match our format
            const transformedPackages = backendPackages.map(pkg => ({
              id: pkg.id,
              title: pkg.title || `${pkg.coins} Coins`,
              coins: parseInt(pkg.coins),
              amount: parseFloat(pkg.coins * 0.1), // 10 coins = £1 (based on Elite Quiz rate)
              currency: 'GBP',
              description: pkg.description || `Purchase ${pkg.coins} coins`,
              popular: pkg.coins === 50 // Mark 50 coins as popular
            }))
            setPackages(transformedPackages)
          }
        } else {
          console.error('Failed to load coin packages:', response)
          // Load default packages on API error
          const defaultPackages = [
            {
              id: 1,
              title: '10 Coins',
              coins: 10,
              amount: 1.00,
              currency: 'GBP',
              description: 'Starter pack',
              popular: false
            },
            {
              id: 2,
              title: '50 Coins',
              coins: 50,
              amount: 5.00,
              currency: 'GBP',
              description: 'Popular choice',
              popular: true
            },
            {
              id: 3,
              title: '100 Coins',
              coins: 100,
              amount: 10.00,
              currency: 'GBP',
              description: 'Best value',
              popular: false
            }
          ]
          setPackages(defaultPackages)
        }
        setLoading(false)
      },
      onError: (error) => {
        console.error('Error loading coin packages:', error)
        // Load default packages on error
        const defaultPackages = [
          {
            id: 1,
            title: '10 Coins',
            coins: 10,
            amount: 1.00,
            currency: 'GBP',
            description: 'Starter pack',
            popular: false
          },
          {
            id: 2,
            title: '50 Coins',
            coins: 50,
            amount: 5.00,
            currency: 'GBP',
            description: 'Popular choice',
            popular: true
          },
          {
            id: 3,
            title: '100 Coins',
            coins: 100,
            amount: 10.00,
            currency: 'GBP',
            description: 'Best value',
            popular: false
          }
        ]
        setPackages(defaultPackages)
        setLoading(false)
      }
    })
  }

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setSelectedPackage(null)
    onClose()
    toast.success(t('payment_successful'))
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setSelectedPackage(null)
  }

  const handleModalClose = () => {
    setShowPaymentForm(false)
    setSelectedPackage(null)
    onClose()
  }

  return (
    <Modal
      title={
        <div className="stripe-modal-header">
          <div className="stripe-logo-title">
            <i className="fab fa-stripe-s stripe-icon"></i>
            <span>{showPaymentForm ? 'Complete Payment' : 'Buy Coins with Stripe'}</span>
          </div>
          {!showPaymentForm && (
            <div className="secure-badge">
              <i className="fas fa-shield-alt"></i>
              <span>Secure Payment</span>
            </div>
          )}
        </div>
      }
      open={isOpen}
      onCancel={handleModalClose}
      footer={null}
      width={showPaymentForm ? 500 : 700}
      className="stripe-payment-modal professional-modal"
      centered
    >
      {showPaymentForm ? (
        stripePromise && stripeReady ? (
          <Elements stripe={stripePromise}>
            <PaymentForm
              selectedPackage={selectedPackage}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </Elements>
        ) : (
          <div className="text-center loading-state">
            <Spin size="large" />
            <p className="loading-text">{t('initializing_stripe')}</p>
            <button className="btn btn-secondary" onClick={handlePaymentCancel}>
              {t('back')}
            </button>
          </div>
        )
      ) : (
        <div className="coin-packages professional-layout">
          {!stripeReady ? (
            <div className="text-center loading-state">
              <Spin size="large" />
              <p className="loading-text">{t('loading_stripe_settings')}</p>
            </div>
          ) : loading ? (
            <div className="text-center loading-state">
              <Spin size="large" />
              <p className="loading-text">{t('loading_packages')}</p>
            </div>
          ) : (
            <>
              <div className="packages-intro">
                <h3 className="packages-title">Choose Your Coin Package</h3>
                <p className="packages-subtitle">
                  Purchase coins securely with Stripe. All transactions are protected by industry-leading security.
                </p>
                <div className="exchange-info">
                  <div className="exchange-rate-display">
                    <span className="rate-highlight">Exchange Rate:</span>
                    <span className="rate-value">10 Coins = £1.00</span>
                  </div>
                  <div className="currency-info">
                    <span>Currency: GBP (British Pounds)</span>
                  </div>
                </div>
              </div>

              <div className="packages-grid professional-grid">
                {packages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className={`package-card professional-card ${pkg.popular ? 'popular-package' : ''} ${pkg.recommended ? 'recommended' : ''}`}
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    {pkg.popular && (
                      <div className="popular-badge">
                        <span>Most Popular</span>
                      </div>
                    )}
                    {pkg.recommended && (
                      <div className="recommended-badge">
                        <span>⭐ Recommended</span>
                      </div>
                    )}

                    <div className="package-header professional-header">
                      <h3>{pkg.title}</h3>
                      <div className="package-subtitle">
                        <span>{pkg.subtitle}</span>
                      </div>
                    </div>

                    <div className="package-body professional-body">
                      <div className="coins-display-main">
                        <div className="coins-amount-section">
                          <img src={coinimg.src} alt="coin" className="coin-icon-large" />
                          <span className="coin-count">{pkg.coins}</span>
                          <span className="coin-label">Coins</span>
                        </div>
                      </div>

                      <div className="price-section">
                        <div className="price-main">
                          <span className="currency">£</span>
                          <span className="amount">{pkg.amount.toFixed(2)}</span>
                        </div>
                        <div className="price-per-coin">
                          <span>£{(pkg.amount / pkg.coins).toFixed(3)} per coin</span>
                        </div>
                      </div>

                      <p className="package-description">{pkg.description}</p>

                      <div className="package-features">
                        <div className="feature-item">
                          <i className="fas fa-bolt"></i>
                          <span>Instant Delivery</span>
                        </div>
                        <div className="feature-item">
                          <i className="fas fa-shield-alt"></i>
                          <span>Secure Payment</span>
                        </div>
                        {pkg.badge && (
                          <div className="feature-item value-badge">
                            <i className="fas fa-star"></i>
                            <span>{pkg.badge}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="package-footer professional-footer">
                      <button className="btn btn-stripe-select">
                        <span>Select Package</span>
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="payment-security-info">
                <div className="security-badges">
                  <div className="security-item">
                    <i className="fab fa-stripe-s"></i>
                    <span>Powered by Stripe</span>
                  </div>
                  <div className="security-item">
                    <i className="fas fa-lock"></i>
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="security-item">
                    <i className="fas fa-shield-alt"></i>
                    <span>PCI DSS Compliant</span>
                  </div>
                </div>

                <div className="test-mode-info">
                  <p className="test-notice">
                    <i className="fas fa-info-circle"></i>
                    <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242 for testing
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}

export default StripePayment
