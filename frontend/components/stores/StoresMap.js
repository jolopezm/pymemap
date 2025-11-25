import React, { useRef, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Platform } from 'react-native'
import MapView from 'react-native-maps'
const { MapMarker } = require('react-native-maps/lib/MapMarker')
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { formatDistance } from '../../utils/geolocation'
import { colors, spacing, borderRadius, shadows, responsive } from '../../styles/theme'

const CARD_WIDTH = responsive.screenWidth * 0.6 // Reduced from 0.7

export default function StoresMap({
    businesses,
    userCoords,
    selectedMapBusiness,
    onBusinessSelect,
    onMarkerPress,
}) {
    const mapRef = useRef(null)
    const scrollViewRef = useRef(null)

    // Helper to validate coords
    const isValidCoords = (coords) => {
        return coords &&
            typeof coords.latitude === 'number' &&
            typeof coords.longitude === 'number' &&
            !isNaN(coords.latitude) &&
            !isNaN(coords.longitude)
    }

    const businessesWithCoords = businesses?.filter(b => b.latitude && b.longitude) || []

    const centerMapOnBusiness = (business) => {
        if (Platform.OS === 'web') return

        if (mapRef.current && business.latitude && business.longitude) {
            mapRef.current.animateToRegion({
                latitude: business.latitude,
                longitude: business.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500)
        }
    }

    const recenterMap = () => {
        if (Platform.OS === 'web') return

        if (mapRef.current && isValidCoords(userCoords)) {
            mapRef.current.animateToRegion({
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 500)
        }
    }

    useEffect(() => {
        if (selectedMapBusiness) {
            const index = businessesWithCoords.findIndex(
                b => (b.id && b.id === selectedMapBusiness.id) ||
                    (b._id && b._id === selectedMapBusiness._id)
            )

            if (index !== -1 && scrollViewRef.current) {
                const scrollX = index * (CARD_WIDTH + 12)
                scrollViewRef.current.scrollTo({ x: scrollX, animated: true })
                centerMapOnBusiness(selectedMapBusiness)
            }
        }
    }, [selectedMapBusiness])

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
                ref={mapRef}
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

                {/* Marcadores de Negocios */}
                {businessesWithCoords.map((business) => {
                    const lat = parseFloat(business.latitude)
                    const lng = parseFloat(business.longitude)

                    if (isNaN(lat) || isNaN(lng)) return null

                    return (
                        <MapMarker
                            key={business.id || business._id}
                            coordinate={{
                                latitude: lat,
                                longitude: lng
                            }}
                            onPress={() => {
                                if (onMarkerPress) onMarkerPress(business)
                                centerMapOnBusiness(business)
                            }}
                            pinColor={colors.primary}
                            tracksViewChanges={false}
                        />
                    )
                })}
            </MapView>

            {/* Botón de Recentrar */}
            <Pressable
                style={styles.recenterButton}
                onPress={recenterMap}
            >
                <Ionicons name="locate" size={24} color={colors.primary} />
            </Pressable>

            {/* Cards horizontales del mapa */}
            <View style={styles.cardsContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.cardsScroll}
                    snapToInterval={CARD_WIDTH + 12}
                    decelerationRate="fast"
                    snapToAlignment="start"
                >
                    {businessesWithCoords.map((business, index) => {
                        const businessId = business._id || business.id
                        const selectedId = selectedMapBusiness?._id || selectedMapBusiness?.id
                        const isSelected = selectedMapBusiness !== null && businessId === selectedId

                        return (
                            <Pressable
                                key={business.id || business._id || index}
                                style={[styles.card, isSelected && styles.cardSelected]}
                                onPress={() => {
                                    if (onMarkerPress) onMarkerPress(business)
                                    centerMapOnBusiness(business)
                                }}
                            >
                                <View style={styles.cardImage}>
                                    {business.profile_pic ? (
                                        <Image
                                            source={{ uri: business.profile_pic }}
                                            style={styles.cardImageFull}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={['#F5F0FF', '#E8D5FF']}
                                            style={styles.cardImageFull}
                                        >
                                            <Ionicons name="storefront-outline" size={36} color={colors.primary} />
                                        </LinearGradient>
                                    )}

                                    {business.distance !== undefined && (
                                        <View style={styles.distanceBadge}>
                                            <Ionicons name="location" size={10} color={colors.white} />
                                            <Text style={styles.distanceBadgeText}>
                                                {formatDistance(business.distance)}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>
                                        {business.name}
                                    </Text>
                                    <View style={styles.cardFooter}>
                                        <View style={styles.cardMeta}>
                                            <Ionicons name="star" size={12} color="#FFB800" />
                                            <Text style={styles.cardRating}>4.{5 + (index % 5)}</Text>
                                        </View>
                                        <Pressable onPress={() => onBusinessSelect && onBusinessSelect(business)}>
                                            <Ionicons name="chevron-forward-circle" size={24} color={colors.primary} />
                                        </Pressable>
                                    </View>
                                </View>
                            </Pressable>
                        )
                    })}
                </ScrollView>
            </View>
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
    recenterButton: {
        position: 'absolute',
        top: spacing.lg,
        right: spacing.lg,
        backgroundColor: colors.white,
        padding: spacing.sm,
        borderRadius: borderRadius.circle,
        ...shadows.medium,
        zIndex: 10,
    },
    cardsContainer: {
        position: 'absolute',
        bottom: spacing.lg,
        left: 0,
        right: 0,
    },
    cardsScroll: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        overflow: 'hidden',
        ...shadows.card,
    },
    cardSelected: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    cardImage: {
        width: '100%',
        height: 100, // Reduced height
        position: 'relative',
    },
    cardImageFull: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    distanceBadge: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.small,
        gap: spacing.xs,
    },
    distanceBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '600',
    },
    cardContent: {
        padding: spacing.sm, // Reduced padding
    },
    cardTitle: {
        fontSize: 14, // Reduced font size
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    cardRating: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
    cardCategory: {
        fontSize: 11,
        color: colors.textLight,
    },
})
