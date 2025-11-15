import * as Location from 'expo-location'

/**
 * Solicita permisos de ubicación al usuario
 * @returns {Promise<boolean>} true si se concedieron los permisos, false en caso contrario
 */
export async function requestLocationPermission() {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        return status === 'granted'
    } catch (error) {
        console.error('Error al solicitar permisos de ubicación:', error)
        return false
    }
}

/**
 * Obtiene la ubicación actual del usuario
 * @returns {Promise<{latitude: number, longitude: number, address: string} | null>}
 */
export async function getCurrentLocation() {
    try {
        const hasPermission = await requestLocationPermission()
        
        if (!hasPermission) {
            console.warn('No se concedieron permisos de ubicación')
            return null
        }

        // Usar la mayor precisión posible para obtener coordenadas exactas
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
            maximumAge: 10000, // Cache de 10 segundos para respuestas más rápidas
            timeout: 15000, // Timeout de 15 segundos
        })

        const { latitude, longitude } = location.coords

        // Obtener dirección legible usando Nominatim (OpenStreetMap) - Gratuito
        let address = 'Ubicación actual'
        try {
            address = await reverseGeocodeWithNominatim(latitude, longitude)
        } catch (geocodeError) {
            console.warn('Error al obtener dirección con Nominatim, usando fallback:', geocodeError)
            // Fallback al geocoder nativo
            try {
                const [result] = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                })

                if (result) {
                    const parts = []
                    
                    if (result.street) {
                        if (result.streetNumber) {
                            parts.push(`${result.street} ${result.streetNumber}`)
                        } else {
                            parts.push(result.street)
                        }
                    } else if (result.name) {
                        parts.push(result.name)
                    }
                    
                    if (result.district) {
                        parts.push(result.district)
                    } else if (result.subregion) {
                        parts.push(result.subregion)
                    } else if (result.city) {
                        parts.push(result.city)
                    }
                    
                    if (result.city && result.city !== result.district) {
                        if (parts.length > 0 && !parts.includes(result.city)) {
                            parts.push(result.city)
                        }
                    }
                    
                    address = parts.join(', ') || 'Ubicación actual'
                }
            } catch (fallbackError) {
                console.warn('Error en geocodificación fallback:', fallbackError)
            }
        }

        return {
            latitude,
            longitude,
            address,
        }
    } catch (error) {
        console.error('Error al obtener ubicación:', error)
        return null
    }
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en kilómetros
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
}

/**
 * Convierte grados a radianes
 */
function toRad(degrees) {
    return degrees * (Math.PI / 180)
}

/**
 * Formatea la distancia para mostrar
 * @param {number} distance - Distancia en kilómetros
 * @returns {string} Distancia formateada (ej: "1.5 km" o "350 m")
 */
export function formatDistance(distance) {
    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`
    }
    return `${distance.toFixed(1)} km`
}

/**
 * Calcula distancias para una lista de negocios y los ordena por proximidad
 * @param {Array} businesses - Lista de negocios con coordenadas
 * @param {number} userLat - Latitud del usuario
 * @param {number} userLon - Longitud del usuario
 * @returns {Array} Lista de negocios con distancia calculada y ordenados por proximidad
 */
export function calculateBusinessDistances(businesses, userLat, userLon) {
    if (!userLat || !userLon) return businesses

    return businesses
        .map(business => {
            // Si el negocio tiene coordenadas, calcular distancia
            if (business.latitude && business.longitude) {
                const distance = calculateDistance(
                    userLat,
                    userLon,
                    business.latitude,
                    business.longitude
                )
                return {
                    ...business,
                    distance,
                    distanceText: formatDistance(distance),
                }
            }
            // Si no tiene coordenadas, poner al final
            return {
                ...business,
                distance: Infinity,
                distanceText: 'N/A',
            }
        })
        .sort((a, b) => a.distance - b.distance)
}

/**
 * Geocodificación inversa usando Nominatim (OpenStreetMap) - Gratuito
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Promise<string>} Dirección formateada
 */
async function reverseGeocodeWithNominatim(latitude, longitude) {
    try {
        // Nominatim es el servicio de geocoding de OpenStreetMap - completamente gratuito
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=es`
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'PymeMap/1.0', // Nominatim requiere un User-Agent
            },
        })
        
        const data = await response.json()

        if (data && data.address) {
            const addr = data.address
            const parts = []
            
            // Construir dirección desde los componentes de Nominatim
            if (addr.road) {
                if (addr.house_number) {
                    parts.push(`${addr.road} ${addr.house_number}`)
                } else {
                    parts.push(addr.road)
                }
            } else if (addr.pedestrian) {
                parts.push(addr.pedestrian)
            } else if (addr.neighbourhood) {
                parts.push(addr.neighbourhood)
            }
            
            // Agregar comuna/barrio
            if (addr.suburb) {
                parts.push(addr.suburb)
            } else if (addr.neighbourhood && !parts.includes(addr.neighbourhood)) {
                parts.push(addr.neighbourhood)
            }
            
            // Agregar ciudad
            if (addr.city) {
                parts.push(addr.city)
            } else if (addr.town) {
                parts.push(addr.town)
            } else if (addr.municipality) {
                parts.push(addr.municipality)
            }

            const address = parts.length > 0 ? parts.join(', ') : data.display_name

            console.log('📍 Nominatim Geocoding:', {
                coords: { latitude, longitude },
                address_components: addr,
                formatted_address: address,
                full_display: data.display_name
            })

            return address
        }

        return 'Ubicación actual'
    } catch (error) {
        console.error('Error en Nominatim Geocoding:', error)
        throw error
    }
}

/**
 * Geocodifica una dirección para obtener coordenadas usando Nominatim
 * @param {string} address - Dirección a geocodificar
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function geocodeAddress(address) {
    try {
        // Usar Nominatim (OpenStreetMap) - gratuito
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=cl&addressdetails=1&accept-language=es`
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'PymeMap/1.0',
            },
        })
        
        const data = await response.json()

        if (data && data.length > 0) {
            const result = data[0]
            console.log('📍 Nominatim Geocoding forward:', {
                address,
                coords: { lat: parseFloat(result.lat), lon: parseFloat(result.lon) },
                fullAddress: result.display_name
            })
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon)
            }
        }

        // Fallback al geocoder nativo
        console.log('⚠️ Nominatim no encontró resultados, usando geocoder nativo')
        const results = await Location.geocodeAsync(address)
        
        if (results && results.length > 0) {
            const { latitude, longitude } = results[0]
            return { latitude, longitude }
        }
        
        return null
    } catch (error) {
        console.error('Error al geocodificar dirección:', error)
        
        // Intentar fallback nativo
        try {
            const results = await Location.geocodeAsync(address)
            if (results && results.length > 0) {
                const { latitude, longitude } = results[0]
                return { latitude, longitude }
            }
        } catch (fallbackError) {
            console.error('Error en fallback de geocodificación:', fallbackError)
        }
        
        return null
    }
}
