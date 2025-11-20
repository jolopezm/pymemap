import React, { createContext, useState, useContext, useEffect } from 'react'
import { getCurrentLocation } from '../utils/geolocation'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LocationContext = createContext()

const STORAGE_KEYS = {
    USER_LOCATION: '@user_location',
    USER_COORDS: '@user_coords',
    CACHE_TIMESTAMP: '@location_cache_timestamp',
}

const CACHE_DURATION = 15 * 60 * 1000 // 15 minutos

export function LocationProvider({ children }) {
    const [userLocation, setUserLocation] = useState(
        'Toca aquí para activar ubicación'
    )
    const [userCoords, setUserCoords] = useState(null)
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [locationError, setLocationError] = useState(null)
    const [permissionRequested, setPermissionRequested] = useState(false)
    const [isFromCache, setIsFromCache] = useState(false)

    // Cargar ubicación guardada al inicio
    useEffect(() => {
        loadLocationFromCache()
    }, [])

    const saveToCache = async (coords, address) => {
        try {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.USER_LOCATION, address],
                [STORAGE_KEYS.USER_COORDS, JSON.stringify(coords)],
                [STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString()],
            ])
            console.log('✅ Ubicación guardada en caché')
        } catch (error) {
            console.error('Error guardando ubicación:', error)
        }
    }

    const loadLocationFromCache = async () => {
        try {
            const [[, address], [, coordsJson], [, timestamp]] =
                await AsyncStorage.multiGet([
                    STORAGE_KEYS.USER_LOCATION,
                    STORAGE_KEYS.USER_COORDS,
                    STORAGE_KEYS.CACHE_TIMESTAMP,
                ])

            if (address && coordsJson && timestamp) {
                const cacheAge = Date.now() - parseInt(timestamp)
                const isStale = cacheAge > CACHE_DURATION
                const coords = JSON.parse(coordsJson)

                if (!isStale) {
                    console.log(
                        `📦 Ubicación cargada del caché (${Math.floor(cacheAge / 1000)}s antiguo)`
                    )
                    setUserLocation(address)
                    setUserCoords(coords)
                    setIsFromCache(true)
                } else {
                    console.log('⚠️ Ubicación en caché obsoleta')
                }
            }
        } catch (error) {
            console.error('Error cargando ubicación del caché:', error)
        }
    }

    const fetchLocation = async (forceRefresh = false) => {
        try {
            setIsLoadingLocation(true)
            setLocationError(null)
            setPermissionRequested(true)
            console.log(
                '🌍 [LocationContext] Solicitando permiso y obteniendo ubicación...'
            )

            const location = await getCurrentLocation(forceRefresh)

            if (location) {
                console.log(
                    '✅ [LocationContext] Ubicación obtenida:',
                    location.address
                )
                setUserLocation(location.address)
                setUserCoords({
                    latitude: location.latitude,
                    longitude: location.longitude,
                })
                setIsFromCache(false)

                // Guardar en caché
                await saveToCache(
                    {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    },
                    location.address
                )
            } else {
                console.warn(
                    '⚠️ [LocationContext] No se pudo obtener ubicación'
                )
                setUserLocation('Toca aquí para activar ubicación')
                setLocationError(
                    'No se pudo obtener la ubicación. Verifica los permisos.'
                )
            }
        } catch (error) {
            console.error(
                '❌ [LocationContext] Error al obtener ubicación:',
                error
            )
            setUserLocation('Error al obtener ubicación')
            setLocationError(error.message)
        } finally {
            setIsLoadingLocation(false)
        }
    }

    // Actualizar ubicación manualmente (ej: cuando el usuario selecciona en el mapa)
    const updateLocation = async (coords, address) => {
        console.log('📍 [LocationContext] Ubicación actualizada manualmente')
        setUserCoords(coords)
        setUserLocation(
            address ||
                `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
        )
        setIsFromCache(false)

        // Guardar en caché
        await saveToCache(
            coords,
            address ||
                `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
        )
    }

    const clearLocationCache = async () => {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.USER_LOCATION,
                STORAGE_KEYS.USER_COORDS,
                STORAGE_KEYS.CACHE_TIMESTAMP,
            ])
            console.log('🗑️ Caché de ubicación limpiado')
        } catch (error) {
            console.error('Error limpiando caché de ubicación:', error)
        }
    }

    const value = {
        userLocation,
        userCoords,
        isLoadingLocation,
        locationError,
        permissionRequested,
        isFromCache,
        fetchLocation,
        updateLocation,
        clearLocationCache,
    }

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    )
}

// Hook personalizado para usar el contexto
export function useLocation() {
    const context = useContext(LocationContext)
    if (!context) {
        throw new Error('useLocation debe ser usado dentro de LocationProvider')
    }
    return context
}
