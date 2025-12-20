'use client'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const ReduxWrapper = ({ children, fallback = null }) => {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Try to access Redux store to check if it's available
    let storeAvailable = false
    try {
        // This will throw if Redux context is not available
        const testSelector = useSelector(state => state !== undefined)
        storeAvailable = true
    } catch (error) {
        console.warn('Redux store not available:', error.message)
        storeAvailable = false
    }

    // Only render children if we're on client and store is available
    if (!isClient || !storeAvailable) {
        return fallback
    }

    return children
}

export default ReduxWrapper
