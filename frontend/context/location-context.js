import React, { createContext, useState, useContext, useEffect } from 'react'
import { getCurrentLocation } from '../utils/geolocation'

const LocationContext = createContext()

export function LocationProvider({ children }) {
    const [userLocation, setUserLocation] = useState('Toca aquí para activar ubicación')
    const [userCoords, setUserCoords] = useState(null)
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [locationError, setLocationError] = useState(null)
    const [permissionRequested, setPermissionRequested] = useState(false)

    // NO obtener ubicación automáticamente al inicio
    // La ubicación se obtendrá cuando el usuario lo solicite explícitamente

    const fetchLocation = async (forceRefresh = false) => {
        try {
            setIsLoadingLocation(true)
            setLocationError(null)
            setPermissionRequested(true)
            console.log('🌍 [LocationContext] Solicitando permiso y obteniendo ubicación...')
            
            const location = await getCurrentLocation(forceRefresh)
            
            if (location) {
                console.log('✅ [LocationContext] Ubicación obtenida:', location.address)
                setUserLocation(location.address)
                setUserCoords({
                    latitude: location.latitude,
                    longitude: location.longitude,
                })
            } else {
                console.warn('⚠️ [LocationContext] No se pudo obtener ubicación')
                setUserLocation('Toca aquí para activar ubicación')
                setLocationError('No se pudo obtener la ubicación. Verifica los permisos.')
            }
        } catch (error) {
            console.error('❌ [LocationContext] Error al obtener ubicación:', error)
            setUserLocation('Error al obtener ubicación')
            setLocationError(error.message)
        } finally {
            setIsLoadingLocation(false)
        }
    }

    // Actualizar ubicación manualmente (ej: cuando el usuario selecciona en el mapa)
    const updateLocation = (coords, address) => {
        console.log('📍 [LocationContext] Ubicación actualizada manualmente')
        setUserCoords(coords)
        setUserLocation(address || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`)
    }

    const value = {
        userLocation,
        userCoords,
        isLoadingLocation,
        locationError,
        permissionRequested,
        fetchLocation,
        updateLocation,
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
