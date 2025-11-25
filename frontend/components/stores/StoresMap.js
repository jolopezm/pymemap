import React from 'react'
import { View, StyleSheet } from 'react-native'
import MapView from 'react-native-maps'
const { MapMarker } = require('react-native-maps/lib/MapMarker')
import { colors } from '../../styles/theme'

export default function StoresMap({
    userCoords,
}) {

    // Helper to validate coords
    const isValidCoords = (coords) => {
        return coords &&
            typeof coords.latitude === 'number' &&
            typeof coords.longitude === 'number' &&
            !isNaN(coords.latitude) &&
            !isNaN(coords.longitude)
    }

    const initialRegion = isValidCoords(userCoords) ? {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : {
        latitude: -33.4489, // Santiago default
        longitude: -70.6693,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
            >
                {/* Marcador de Ubicación del Usuario (Real Marker) */}
                {isValidCoords(userCoords) && (
                    <MapMarker
                        coordinate={{
                            latitude: userCoords.latitude,
                            longitude: userCoords.longitude
                        }}
                        zIndex={999}
                        tracksViewChanges={false} // Optimization
                    >
                        <View style={{
                            backgroundColor: 'white',
                            borderRadius: 20,
                            padding: 2,
                            borderWidth: 2,
                            borderColor: 'white',
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}>
                            <View style={{
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                backgroundColor: colors.info,
                                borderWidth: 2,
                                borderColor: 'white',
                            }} />
                        </View>
                    </MapMarker>
                )}
            </MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
})
