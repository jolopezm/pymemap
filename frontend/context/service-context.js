import React, {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useContext,
} from 'react'
import { getServices } from '../api/business-service'
import { useAuth } from './auth-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import logger from '../utils/logger'

const ServiceContext = createContext({})

const STORAGE_KEYS = {
    SERVICES: '@services_data',
    CACHE_TIMESTAMP: '@services_cache_timestamp',
}

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutos

export const ServiceProvider = ({ children }) => {
    const { user } = useAuth()
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [isFromCache, setIsFromCache] = useState(false)

    const saveToCache = useCallback(async servicesData => {
        try {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.SERVICES, JSON.stringify(servicesData)],
                [STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString()],
            ])
        } catch (error) {
            // Error manejado silenciosamente
        }
    }, [])

    const loadFromCache = useCallback(async () => {
        try {
            const [[, servicesJson], [, timestamp]] =
                await AsyncStorage.multiGet([
                    STORAGE_KEYS.SERVICES,
                    STORAGE_KEYS.CACHE_TIMESTAMP,
                ])

            if (servicesJson && timestamp) {
                const cacheAge = Date.now() - parseInt(timestamp)
                const isStale = cacheAge > CACHE_DURATION

                return {
                    services: JSON.parse(servicesJson),
                    isStale,
                    cacheAge: Math.floor(cacheAge / 1000),
                }
            }

            return null
        } catch (error) {
            logger.error('Error cargando servicios del caché:', error)
            return null
        }
    }, [])

    const fetchServices = useCallback(
        async (forceRefresh = false) => {
            setLoading(true)

            try {
                // 1️⃣ Intentar cargar del caché primero
                if (!forceRefresh) {
                    const cached = await loadFromCache()

                    if (cached && !cached.isStale) {
                        setServices(cached.services)
                        setIsFromCache(true)
                        setLoading(false)

                        // Actualizar en segundo plano
                        setTimeout(() => fetchServices(true), 100)
                        return
                    }

                    // Si hay caché obsoleto, úsalo mientras cargas
                    if (cached) {
                        setServices(cached.services)
                        setIsFromCache(true)
                    }
                }

                // 2️⃣ Obtener datos frescos
                const servicesData = await getServices()
                setServices(servicesData)
                setIsFromCache(false)

                await saveToCache(servicesData)
            } catch (error) {
                logger.error('Error fetching services:', error)

                // 3️⃣ Fallback a caché en caso de error
                const cached = await loadFromCache()
                if (cached) {
                    setServices(cached.services)
                    setIsFromCache(true)
                } else {
                    setServices([])
                }
            } finally {
                setLoading(false)
            }
        },
        [loadFromCache, saveToCache]
    )

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    const value = useMemo(
        () => ({
            services,
            fetchServices,
            loading,
            isFromCache,
        }),
        [services, fetchServices, loading, isFromCache]
    )

    return (
        <ServiceContext.Provider value={value}>
            {children}
        </ServiceContext.Provider>
    )
}

export const useService = () => useContext(ServiceContext)

