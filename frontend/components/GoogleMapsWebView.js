import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

function GoogleMapsWebView({ address, height = 900, width = '100%' }) {
    const encodedAddress = encodeURIComponent(address)
    const src = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

    return (
        <View style={[styles.container, { height, width }]}>
            <WebView source={{ uri: src }} style={{ flex: 1 }} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
})

export default GoogleMapsWebView
