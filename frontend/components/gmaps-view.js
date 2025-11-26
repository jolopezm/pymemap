import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

function GmapsView({
    address,
    latitude,
    longitude,
    userLatitude,
    userLongitude,
    userLocation, // Objeto con { latitude, longitude }
    businesses, // Array de negocios para mostrar múltiples marcadores
    onMarkerPress, // Callback cuando se hace clic en un marcador
    selectedBusiness, // Negocio seleccionado actualmente
    height = 900,
    width = '100%',
    isOnMobile = true,
}) {
    let src = ''

    // MODO 1: Vista de múltiples negocios (para stores.js)
    if (businesses && businesses.length > 0) {
        const userLat = userLocation?.latitude || userLatitude
        const userLon = userLocation?.longitude || userLongitude
        
        // Obtener coordenadas del negocio (soportar ambos formatos)
        const getBusinessCoords = (business) => {
            if (business.coordinates) {
                return {
                    lat: business.coordinates.latitude,
                    lon: business.coordinates.longitude
                }
            }
            return {
                lat: business.latitude,
                lon: business.longitude
            }
        }
        
        // Crear URL base de embed con el centro en la ubicación del usuario
        const firstBusiness = getBusinessCoords(businesses[0])
        const centerLat = userLat || firstBusiness.lat
        const centerLon = userLon || firstBusiness.lon
        
        // Usar Google Maps Embed API para mostrar múltiples marcadores
        // Construir la query con todos los negocios
        const markers = businesses.map(b => {
            const coords = getBusinessCoords(b)
            return `${coords.lat},${coords.lon}`
        }).join('|')
        
        // URL con múltiples marcadores usando el modo "search" con coordenadas
        src = `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLon}&query_place_id=&zoom=13`
        
    // MODO 2: Ruta a un negocio específico (para business-profile.js)
    } else if (latitude && longitude) {
        const userLat = userLocation?.latitude || userLatitude
        const userLon = userLocation?.longitude || userLongitude
        
        if (userLat && userLon) {
            // Mostrar ruta desde ubicación del usuario hasta el negocio
            src = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${latitude},${longitude}&travelmode=driving`
        } else {
            // Solo mostrar ubicación del negocio
            src = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        }
    } else if (address) {
        // Fallback a dirección si no hay coordenadas
        const encodedAddress = encodeURIComponent(address)
        const userLat = userLocation?.latitude || userLatitude
        const userLon = userLocation?.longitude || userLongitude
        
        if (userLat && userLon) {
            src = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${encodedAddress}&travelmode=driving`
        } else {
            src = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
        }
    }

    if (isOnMobile) {
        return (
            <View style={[styles.container, { height, width }]}>
                <WebView source={{ uri: src }} style={{ flex: 1 }} />
            </View>
        )
    }

    return (
        <iframe
            title="Google Maps"
            src={src}
            width={width}
            height={height}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
})

export default GmapsView
