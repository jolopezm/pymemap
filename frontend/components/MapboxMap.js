import React from 'react'
import { View, StyleSheet, Text, Platform } from 'react-native'
import MapboxGL from '@rnmapbox/maps'

// La configuración del token solo es necesaria para plataformas nativas
if (Platform.OS !== 'web') {
    MapboxGL.setAccessToken(
        'pk.eyJ1Ijoiam9sb3Blem0iLCJhIjoiY21mdDE1dGRmMHB1cTJxcHJtNDFnczdqdSJ9.LT3d92adNrJLJWgiplHrBA'
    )
}

const MapboxMap = ({ centerCoordinate, markerCoordinate }) => {
    // Si estamos en la web, mostramos un mensaje en lugar del mapa.
    if (Platform.OS === 'web') {
        return (
            <View style={[styles.container, styles.webContainer]}>
                <Text>El mapa no está disponible en la versión web.</Text>
            </View>
        )
    }

    // En iOS y Android, renderizamos el mapa como antes.
    return (
        <View style={styles.container}>
            <MapboxGL.MapView style={styles.map}>
                <MapboxGL.Camera
                    zoomLevel={14}
                    centerCoordinate={centerCoordinate}
                    animationMode={'flyTo'}
                    animationDuration={1500}
                />
                {markerCoordinate && (
                    <MapboxGL.PointAnnotation
                        id="marker"
                        coordinate={markerCoordinate}
                    />
                )}
            </MapboxGL.MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 400,
        width: '100%',
    },
    map: {
        flex: 1,
    },
    // Estilo para el contenedor web
    webContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
})

export default MapboxMap
