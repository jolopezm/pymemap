import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

function GoogleMapsWebView({ address, width = '100%', height = 400 }) {
    const encodedAddress = encodeURIComponent(address)
    const src = `https://www.google.com/maps?q=${encodedAddress}&output=embed`

    return (
        <View style={[styles.container, { width, height }]}>
            <WebView
                source={{ uri: src }}
                style={{ flex: 1 }}
                javaScriptEnabled
                domStorageEnabled
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
})

export default GoogleMapsWebView
