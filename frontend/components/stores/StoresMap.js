import React, { useRef, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Platform } from 'react-native'
import PropTypes from 'prop-types'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { MapView, Marker } from '../map-view-wrapper'
import { formatDistance } from '../../utils/geolocation'
import { colors, spacing, borderRadius, shadows, responsive } from '../../styles/theme'

const CARD_WIDTH = responsive.screenWidth * 0.7
const CARD_PADDING = spacing.lg

export default function StoresMap({
    businesses,
    userCoords,
    selectedMapBusiness,
    onMarkerPress,
    onBusinessSelect,
    onMapReady,
}) {
    const mapRef = useRef(null)
    const scrollViewRef = useRef(null)

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

    const fitMapToMarkers = () => {
        if (Platform.OS === 'web' || !mapRef.current || !userCoords) return
        
        const businessesWithCoords = businesses.filter(b => b.latitude && b.longitude)
        if (businessesWithCoords.length === 0) return

        const lats = [...businessesWithCoords.map(b => b.latitude), userCoords.latitude]
        const lons = [...businessesWithCoords.map(b => b.longitude), userCoords.longitude]
        
        const minLat = Math.min(...lats)
        const maxLat = Math.max(...lats)
        const minLon = Math.min(...lons)
        const maxLon = Math.max(...lons)
        
        const centerLat = (minLat + maxLat) / 2
        const centerLon = (minLon + maxLon) / 2
        const latDelta = (maxLat - minLat) * 1.3
        const lonDelta = (maxLon - minLon) * 1.3
        
        mapRef.current.animateToRegion({
            latitude: centerLat,
            longitude: centerLon,
            latitudeDelta: Math.max(latDelta, 0.02),
            longitudeDelta: Math.max(lonDelta, 0.02),
        }, 500)
    }

    useEffect(() => {
        if (businesses.length > 0) {
            setTimeout(() => fitMapToMarkers(), 300)
        }
    }, [businesses])

    useEffect(() => {
        if (selectedMapBusiness) {
            const businessesWithCoords = businesses.filter(b => b.latitude && b.longitude)
            const index = businessesWithCoords.findIndex(
                b => (b.id && b.id === selectedMapBusiness.id) || 
                     (b._id && b._id === selectedMapBusiness._id)
            )
            
            if (index !== -1 && scrollViewRef.current) {
                const scrollX = index * (CARD_WIDTH + 12)
                scrollViewRef.current.scrollTo({ x: scrollX, animated: true })
            }
        }
    }, [selectedMapBusiness])

    if (Platform.OS === 'web' || !userCoords || businesses.length === 0) {
        return (
            <View style={styles.placeholder}>
                <LinearGradient
                    colors={['#E8E8E8', '#F5F5F5']}
                    style={styles.gradient}
                >
                    <Ionicons name="location-outline" size={48} color="#999" />
                    <Text style={styles.placeholderText}>
                        {Platform.OS === 'web'
                            ? 'Vista de mapa no disponible en web. Usa la vista de Lista.'
                            : !userCoords 
                            ? 'Habilita tu ubicación para ver el mapa'
                            : 'No hay negocios para mostrar'}
                    </Text>
                </LinearGradient>
            </View>
        )
    }

    const businessesWithCoords = businesses.filter(b => b.latitude && b.longitude)

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: userCoords.latitude,
                    longitude: userCoords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                onMapReady={onMapReady}
            >
                {businessesWithCoords.map((business) => (
                    <Marker
                        key={business.id || business._id}
                        coordinate={{
                            latitude: parseFloat(business.latitude),
                            longitude: parseFloat(business.longitude)
                        }}
                        title={business.name}
                        description={business.category}
                        onPress={() => onMarkerPress(business)}
                        pinColor={colors.primary}
                    />
                ))}
            </MapView>

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
                                    onMarkerPress(business)
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
                                            <Text style={styles.cardCategory}>• {business.category || 'Servicios'}</Text>
                                        </View>
                                        <Pressable onPress={() => onBusinessSelect(business)}>
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

StoresMap.propTypes = {
    businesses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        _id: PropTypes.string,
        name: PropTypes.string,
        category: PropTypes.string,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        distance: PropTypes.number,
        profile_pic: PropTypes.string,
    })).isRequired,
    userCoords: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
    }),
    selectedMapBusiness: PropTypes.object,
    onMarkerPress: PropTypes.func.isRequired,
    onBusinessSelect: PropTypes.func.isRequired,
    onMapReady: PropTypes.func,
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
    placeholder: {
        flex: 1,
        minHeight: 400,
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    placeholderText: {
        marginTop: spacing.lg,
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
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
        height: 120,
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
        fontSize: 11,
        fontWeight: '600',
    },
    cardContent: {
        padding: spacing.md,
    },
    cardTitle: {
        fontSize: 16,
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
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
    },
    cardCategory: {
        fontSize: 12,
        color: colors.textLight,
    },
})
