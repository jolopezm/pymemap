import { getServices } from '../api/business-service'
import React from 'react'
import { useAuth } from './auth-context'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ServiceContext = React.createContext({})

const STORAGE_KEYS = {
    SERVICES: '@services_data',
    CACHE_TIMESTAMP: '@services_cache_timestamp',
}

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutos

export const ServiceProvider = ({ children }) => {
    const { user } = useAuth()
    const [services, setServices] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [isFromCache, setIsFromCache] = React.useState(false)

    const saveToCache = async servicesData => {
        try {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.SERVICES, JSON.stringify(servicesData)],
                [STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString()],
            ])
            console.log('✅ Servicios guardados en caché')
        } catch (error) {
            console.error('Error guardando servicios:', error)
        }
    }

    const loadFromCache = async () => {
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
            console.error('Error cargando servicios del caché:', error)
            return null
        }
    }

    const fetchServices = async (forceRefresh = false) => {
        setLoading(true)

        try {
            // 1️⃣ Intentar cargar del caché primero
            if (!forceRefresh) {
                const cached = await loadFromCache()

                if (cached && !cached.isStale) {
                    console.log(
                        `📦 Usando servicios del caché (${cached.cacheAge}s antiguo)`
                    )
                    setServices(cached.services)
                    setIsFromCache(true)
                    setLoading(false)

                    // Actualizar en segundo plano
                    setTimeout(() => fetchServices(true), 100)
                    return
                }

                // Si hay caché obsoleto, úsalo mientras cargas
                if (cached) {
                    console.log('⚠️ Usando caché obsoleto de servicios...')
                    setServices(cached.services)
                    setIsFromCache(true)
                }
            }

            // 2️⃣ Obtener datos frescos
            console.log('🌐 Obteniendo servicios frescos del servidor')
            const servicesData = await getServices()
            setServices(servicesData)
            setIsFromCache(false)

            await saveToCache(servicesData)
        } catch (error) {
            console.error('Error fetching services:', error)

            // 3️⃣ Fallback a caché en caso de error
            const cached = await loadFromCache()
            if (cached) {
                console.log('🆘 Error de red, usando caché de servicios')
                setServices(cached.services)
                setIsFromCache(true)
            } else {
                setServices([])
            }
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchServices()
    }, [])

    return (
        <ServiceContext.Provider
            value={{
                services,
                fetchServices,
                loading,
                isFromCache,
            }}
        >
            {children}
        </ServiceContext.Provider>
    )
}

export const useService = () => React.useContext(ServiceContext)
