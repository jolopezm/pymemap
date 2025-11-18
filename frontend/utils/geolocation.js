import * as Location from 'expo-location'

// Caché de ubicación para evitar múltiples solicitudes
let locationCache = null
let locationCacheTime = null
const CACHE_DURATION = 30000 // 30 segundos

// Rate limiting para APIs externas
let lastNominatimRequest = 0
let lastOSRMRequest = 0
const NOMINATIM_DELAY = 1000 // 1 segundo entre requests (límite de Nominatim)
const OSRM_DELAY = 200 // 200ms entre requests (más permisivo)

/**
 * Solicita permisos de ubicación al usuario
 * @returns {Promise<boolean>} true si se concedieron los permisos, false en caso contrario
 */
export async function requestLocationPermission() {
    try {
        // Primero verificar si ya tenemos permisos
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync()
        
        if (existingStatus === 'granted') {
            console.log('✅ Permisos de ubicación ya concedidos')
            return true
        }

        console.log('📱 Solicitando permisos de ubicación...')
        
        // Solicitar permisos
        const { status } = await Location.requestForegroundPermissionsAsync()
        
        if (status === 'granted') {
            console.log('✅ Permisos de ubicación concedidos')
            return true
        } else {
            console.warn('⚠️ Permisos de ubicación denegados. Estado:', status)
            return false
        }
    } catch (error) {
        console.error('❌ Error al solicitar permisos de ubicación:', error)
        return false
    }
}

/**
 * Obtiene la ubicación actual del usuario (con caché)
 * @param {boolean} forceRefresh - Forzar actualización ignorando caché
 * @returns {Promise<{latitude: number, longitude: number, address: string} | null>}
 */
export async function getCurrentLocation(forceRefresh = false) {
    try {
        // Retornar caché si es válida
        const now = Date.now()
        if (!forceRefresh && locationCache && locationCacheTime && (now - locationCacheTime < CACHE_DURATION)) {
            console.log('✅ Usando ubicación en caché')
            return locationCache
        }

        const hasPermission = await requestLocationPermission()
        
        if (!hasPermission) {
            console.warn('⚠️ No se concedieron permisos de ubicación')
            return null
        }

        console.log('📍 Solicitando ubicación actual...')

        // Intentar primero con alta precisión
        let location = null
        try {
            location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High, // Cambiar a High en lugar de Highest para mejor compatibilidad Android
                maximumAge: 10000,
                timeout: 15000,
            })
            console.log('✅ Ubicación obtenida con alta precisión')
        } catch (highAccuracyError) {
            console.warn('⚠️ Error con alta precisión, intentando con precisión balanceada...', highAccuracyError.message)
            
            // Fallback a precisión balanceada (más confiable en Android)
            try {
                location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                    maximumAge: 30000,
                    timeout: 20000,
                })
                console.log('✅ Ubicación obtenida con precisión balanceada')
            } catch (balancedError) {
                console.error('❌ Error obteniendo ubicación:', balancedError.message)
                throw balancedError
            }
        }

        if (!location || !location.coords) {
            console.error('❌ No se obtuvo ubicación válida')
            return null
        }

        const { latitude, longitude } = location.coords
        console.log('📍 Coordenadas obtenidas:', { latitude, longitude })

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

        const result = {
            latitude,
            longitude,
            address,
        }

        // Actualizar caché
        locationCache = result
        locationCacheTime = Date.now()

        return result
    } catch (error) {
        console.error('Error al obtener ubicación:', error)
        return null
    }
}

/**
 * Calcula la distancia en línea recta entre dos puntos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @param {boolean} applyUrbanFactor - Si true, aplica factor de corrección urbano (1.4x)
 * @returns {number} Distancia en kilómetros
 */
export function calculateDistance(lat1, lon1, lat2, lon2, applyUrbanFactor = true) {
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
    let distance = R * c

    // Aplicar factor de corrección urbano para aproximar distancia real por calles
    // Factor 1.4 es típico para áreas urbanas (considera calles, giros, etc.)
    if (applyUrbanFactor) {
        distance = distance * 1.4
    }

    return distance
}

/**
 * Convierte grados a radianes
 */
function toRad(degrees) {
    return degrees * (Math.PI / 180)
}

/**
 * Obtiene la distancia real por carretera usando OSRM (OpenStreetMap Routing)
 * @param {number} lat1 - Latitud origen
 * @param {number} lon1 - Longitud origen
 * @param {number} lat2 - Latitud destino
 * @param {number} lon2 - Longitud destino
 * @returns {Promise<{distance: number, duration: number} | null>} Distancia en km y duración en minutos
 */
export async function getRoutingDistance(lat1, lon1, lat2, lon2) {
    try {
        // Rate limiting: Esperar si el último request fue muy reciente
        const now = Date.now()
        const timeSinceLastRequest = now - lastOSRMRequest
        if (timeSinceLastRequest < OSRM_DELAY) {
            const waitTime = OSRM_DELAY - timeSinceLastRequest
            console.log(`⏱️ Esperando ${waitTime}ms por rate limiting de OSRM...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
        }
        lastOSRMRequest = Date.now()

        // OSRM API (gratuito) - formato: lon,lat (¡nota el orden!)
        const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
        
        console.log('🚗 Obteniendo distancia real por carretera...')
        const response = await fetch(url)
        const data = await response.json()

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0]
            const distanceKm = route.distance / 1000 // Convertir metros a km
            const durationMin = route.duration / 60 // Convertir segundos a minutos

            console.log(`✅ Distancia real: ${distanceKm.toFixed(2)} km, Tiempo: ${Math.round(durationMin)} min`)
            
            return {
                distance: distanceKm,
                duration: durationMin
            }
        } else {
            console.warn('⚠️ OSRM no pudo calcular la ruta:', data.code)
            return null
        }
    } catch (error) {
        console.error('❌ Error al obtener distancia de OSRM:', error)
        return null
    }
}

/**
 * Formatea la distancia para mostrar
 * @param {number} distance - Distancia en kilómetros
 * @param {boolean} showApprox - Mostrar "~" para indicar aproximación
 * @returns {string} Distancia formateada (ej: "~1.5 km" o "350 m")
 */
export function formatDistance(distance, showApprox = false) {
    const prefix = showApprox ? '~' : ''
    if (distance < 1) {
        return `${prefix}${Math.round(distance * 1000)} m`
    }
    return `${prefix}${distance.toFixed(1)} km`
}

/**
 * Formatea duración en formato legible
 * @param {number} minutes - Duración en minutos
 * @returns {string} Duración formateada (ej: "5 min" o "1h 20min")
 */
export function formatDuration(minutes) {
    if (minutes < 60) {
        return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

/**
 * Calcula distancias para una lista de negocios (usa distancia aproximada con factor urbano)
 * @param {Array} businesses - Lista de negocios con coordenadas
 * @param {Object} userCoords - Objeto con {latitude, longitude} del usuario
 * @returns {Array} Lista de negocios con distancia calculada
 */
export function calculateBusinessDistances(businesses, userCoords) {
    if (!userCoords || !userCoords.latitude || !userCoords.longitude) return businesses
    
    const userLat = userCoords.latitude
    const userLon = userCoords.longitude

    return businesses
        .map(business => {
            // Si el negocio tiene coordenadas, calcular distancia aproximada (con factor urbano)
            if (business.latitude && business.longitude) {
                const distance = calculateDistance(
                    userLat,
                    userLon,
                    business.latitude,
                    business.longitude,
                    true // Aplicar factor urbano 1.4x para aproximar distancia real
                )
                return {
                    ...business,
                    distance,
                    distanceText: formatDistance(distance, true), // Mostrar "~" para indicar aproximación
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
        // Rate limiting: Nominatim requiere máximo 1 request/segundo
        const now = Date.now()
        const timeSinceLastRequest = now - lastNominatimRequest
        if (timeSinceLastRequest < NOMINATIM_DELAY) {
            const waitTime = NOMINATIM_DELAY - timeSinceLastRequest
            console.log(`⏱️ Esperando ${waitTime}ms por rate limiting de Nominatim...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
        }
        lastNominatimRequest = Date.now()

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
        // Rate limiting: Nominatim requiere máximo 1 request/segundo
        const now = Date.now()
        const timeSinceLastRequest = now - lastNominatimRequest
        if (timeSinceLastRequest < NOMINATIM_DELAY) {
            const waitTime = NOMINATIM_DELAY - timeSinceLastRequest
            console.log(`⏱️ Esperando ${waitTime}ms por rate limiting de Nominatim...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
        }
        lastNominatimRequest = Date.now()

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
