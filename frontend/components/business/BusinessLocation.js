import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { Ionicons } from '@expo/vector-icons'
import GmapsView from '../gmaps-view'
import { formatDistance, formatDuration } from '../../utils/geolocation'
import { colors, spacing, borderRadius } from '../../styles/theme'

export default function BusinessLocation({
    business,
    userCoords,
    distance,
    routingInfo,
    loadingRouting,
    isLoadingLocation,
}) {
    const [showMap, setShowMap] = useState(false)

    if (!business?.latitude || !business?.longitude) {
        return null
    }

    const hasUserLocation = userCoords && !isLoadingLocation

    return (
        <View style={styles.container}>
            {/* Distancia y tiempo estimado */}
            {hasUserLocation && distance && (
                <View style={styles.distanceCard}>
                    <View style={styles.distanceRow}>
                        <Ionicons
                            name="navigate-outline"
                            size={20}
                            color={colors.primary}
                        />
                        <Text style={styles.distanceText}>
                            {routingInfo
                                ? `${formatDistance(distance)} por carretera`
                                : `${formatDistance(distance, true)} de tu ubicación`}
                        </Text>
                        {loadingRouting && (
                            <Text style={styles.loadingText}>
                                Calculando ruta...
                            </Text>
                        )}
                    </View>
                    {routingInfo && (
                        <View style={styles.durationRow}>
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color={colors.primary}
                            />
                            <Text style={styles.durationText}>
                                Aprox. {formatDuration(routingInfo.duration)} en auto
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Botón para mostrar/ocultar mapa */}
            <Pressable
                style={styles.mapButton}
                onPress={() => setShowMap(!showMap)}
            >
                <Ionicons
                    name={hasUserLocation ? 'map-outline' : 'location-outline'}
                    size={20}
                    color="#FFF"
                />
                <Text style={styles.mapButtonText}>
                    {showMap
                        ? 'Ocultar mapa'
                        : hasUserLocation
                        ? 'Cómo llegar'
                        : 'Ver en el mapa'}
                </Text>
            </Pressable>

            {/* Mapa */}
            {showMap && (
                <View style={styles.mapContainer}>
                    <GmapsView
                        latitude={business.latitude}
                        longitude={business.longitude}
                        userLatitude={hasUserLocation ? userCoords.latitude : undefined}
                        userLongitude={hasUserLocation ? userCoords.longitude : undefined}
                        height={250}
                    />
                </View>
            )}
        </View>
    )
}

BusinessLocation.propTypes = {
    business: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
    }).isRequired,
    userCoords: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
    }),
    distance: PropTypes.number,
    routingInfo: PropTypes.shape({
        distance: PropTypes.number,
        duration: PropTypes.number,
    }),
    loadingRouting: PropTypes.bool,
    isLoadingLocation: PropTypes.bool,
}

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
    distanceCard: {
        marginBottom: spacing.md,
        backgroundColor: '#F5F0FF',
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    distanceText: {
        marginLeft: spacing.sm,
        fontSize: 14,
        color: '#6A4C93',
        fontWeight: '600',
    },
    loadingText: {
        marginLeft: spacing.sm,
        fontSize: 12,
        color: '#999',
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 28,
    },
    durationText: {
        marginLeft: spacing.xs,
        fontSize: 13,
        color: '#6A4C93',
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    mapButtonText: {
        marginLeft: spacing.sm,
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    mapContainer: {
        height: 250,
        width: '100%',
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
})
