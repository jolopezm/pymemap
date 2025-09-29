import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

function GmapsView({
    address,
    height = 900,
    width = '100%',
    isOnMobile = true,
}) {
    const encodedAddress = encodeURIComponent(address)
    let src = `https://www.google.com/maps?q=${encodedAddress}&output=embed`

    if (isOnMobile) {
        src = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
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
