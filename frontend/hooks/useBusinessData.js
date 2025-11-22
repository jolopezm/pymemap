import { useState, useEffect, useCallback } from 'react'
import { getBusiness } from '../api/business-service'
import { calculateBusinessDistances } from '../utils/geolocation'
import { useLocation } from '../context/location-context'
import logger from '../utils/logger'

export function useBusinessData() {
    const { userCoords } = useLocation()
    const [businesses, setBusinesses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchBusinesses = useCallback(
        async (forceRefresh = false) => {
            try {
                setLoading(true)
                setError(null)

                const data = await getBusiness()

                const processedData = userCoords
                    ? calculateBusinessDistances(data, userCoords)
                    : data

                setBusinesses(processedData)
                return processedData
            } catch (err) {
                logger.error('Error fetching businesses:', err)
                setError(err)
                return []
            } finally {
                setLoading(false)
            }
        },
        [userCoords]
    )

    useEffect(() => {
        fetchBusinesses()
    }, [fetchBusinesses])

    return {
        businesses,
        loading,
        error,
        refetch: fetchBusinesses,
    }
}

export function useBusinessById(businessId) {
    const [business, setBusiness] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchBusiness = async () => {
            if (!businessId) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)

                const data = await getBusiness(businessId)
                setBusiness(data)
            } catch (err) {
                logger.error(`Error fetching business ${businessId}:`, err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchBusiness()
    }, [businessId])

    return { business, loading, error }
}
