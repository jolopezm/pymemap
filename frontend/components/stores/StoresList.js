import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { BusinessCard } from '../business'
import { formatDistance } from '../../utils/geolocation'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '../../styles/theme'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function StoresList({
    businesses,
    userCoords,
    selectedFilters,
    onBusinessPress,
}) {
    const [owners, setOwners] = React.useState([])

    const getOwners = async () => {
        const ownerIds = businesses.map(b => b.owner)
        const otherUsersData = await AsyncStorage.getItem('@other_users_data')
    }

    React.useEffect(() => {
        getOwners()
    }, [businesses])

    if (businesses.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>No se encontraron negocios</Text>
                <Text style={styles.emptySubtext}>
                    Intenta ajustar los filtros o busca en otra ubicación
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    {businesses.length}{' '}
                    {businesses.length === 1
                        ? 'negocio encontrado'
                        : 'negocios encontrados'}
                    {selectedFilters.distance &&
                        ` a menos de ${selectedFilters.distance} km`}
                </Text>
                {userCoords && businesses.some(b => b.distance) && (
                    <Text style={styles.resultsNote}>
                        {selectedFilters.distance
                            ? 'Mostrando solo negocios con ubicación. Distancias aproximadas por calles.'
                            : 'Las distancias son aproximadas por calles'}
                    </Text>
                )}
            </View>

            {businesses.map((business, index) => (
                <BusinessCard
                    key={business.id || business._id || index}
                    business={{
                        ...business,
                        rating: business.rating || 0,
                    }}
                    variant="vertical"
                    showBadge={true}
                    badgeText="Disponible"
                    showFavorite={false}
                    showLogo={true}
                    showDistance={false}
                    onPress={() => onBusinessPress(business)}
                    extraInfo={
                        <View style={styles.businessFooter}>
                            {business.distance !== undefined && (
                                <View style={styles.distanceInfo}>
                                    <Ionicons
                                        name="location"
                                        size={14}
                                        color={colors.primary}
                                    />
                                    <Text style={styles.distanceText}>
                                        {formatDistance(business.distance)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    }
                    style={{ marginBottom: spacing.lg }}
                />
            ))}
        </View>
    )
}

StoresList.propTypes = {
    businesses: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            _id: PropTypes.string,
            name: PropTypes.string,
            category: PropTypes.string,
            distance: PropTypes.number,
            profile_pic: PropTypes.string,
        })
    ).isRequired,
    userCoords: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
    }),
    selectedFilters: PropTypes.shape({
        distance: PropTypes.number,
    }).isRequired,
    onBusinessPress: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxxl * 2,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: spacing.lg,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: spacing.sm,
        textAlign: 'center',
        paddingHorizontal: spacing.xxl,
    },
    resultsHeader: {
        paddingBottom: spacing.md,
    },
    resultsCount: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    resultsNote: {
        fontSize: 11,
        color: colors.textLight,
        marginTop: spacing.xs,
    },
    businessFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    distanceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    distanceText: {
        fontSize: 13,
        color: colors.textLight,
    },
})
