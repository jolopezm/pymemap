import React from 'react'
import { View, StyleSheet } from 'react-native'
// Importamos el objeto principal de la librería
import MapboxGL from '@rnmapbox/maps'

// Configuramos el token de acceso usando el objeto principal
MapboxGL.setAccessToken(
    'pk.eyJ1Ijoiam9sb3Blem0iLCJhIjoiY21mdDE1dGRmMHB1cTJxcHJtNDFnczdqdSJ9.LT3d92adNrJLJWgiplHrBA'
)

const MapboxMap = ({ centerCoordinate, markerCoordinate }) => {
    return (
        <View style={styles.container}>
            {/* Usamos los componentes con el prefijo MapboxGL. */}
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
        backgroundColor: 'tomato',
    },
    map: {
        flex: 1,
    },
})

export default MapboxMap
