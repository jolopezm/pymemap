import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

function GmapsView({
    address,
    latitude,
    longitude,
    userLatitude,
    userLongitude,
    height = 900,
    width = '100%',
    isOnMobile = true,
}) {
    let src = ''

    // Si hay coordenadas específicas, usarlas
    if (latitude && longitude) {
        if (userLatitude && userLongitude) {
            // Mostrar ruta desde ubicación del usuario hasta el negocio
            src = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${latitude},${longitude}&travelmode=driving`
        } else {
            // Solo mostrar ubicación del negocio
            src = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        }
    } else if (address) {
        // Fallback a dirección si no hay coordenadas
        const encodedAddress = encodeURIComponent(address)
        if (userLatitude && userLongitude) {
            src = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${encodedAddress}&travelmode=driving`
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
