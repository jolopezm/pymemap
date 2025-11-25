import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { BusinessCard } from '../business'
import { colors, typography } from '../../styles/theme'

import { useLocation } from '../../context/location-context'
import { Pressable } from 'react-native'

const HomeNearbyStores = React.memo(function HomeNearbyStores({ businesses, onPressBusiness }) {
    const { userCoords, fetchLocation, isLoadingLocation } = useLocation()

    if (!userCoords) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Cerca de ti</Text>
                </View>
                <View style={styles.empty}>
                    <Ionicons name="location-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyText}>Ubicación desactivada</Text>
                    <Text style={styles.emptySubtext}>
                        Activa tu ubicación para ver negocios cercanos
                    </Text>
                    <Pressable
                        style={styles.enableButton}
                        onPress={() => fetchLocation(true)}
                        disabled={isLoadingLocation}
                    >
                        <Text style={styles.enableButtonText}>
                            {isLoadingLocation ? 'Obteniendo...' : 'Activar Ubicación'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Cerca de ti</Text>
            </View>
            {businesses.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="business-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyText}>No se encontraron negocios</Text>
                    <Text style={styles.emptySubtext}>
                        Intenta buscar en otra ubicación
                    </Text>
                </View>
            ) : (
                <View style={styles.list}>
                    {businesses.map((business, index) => (
                        <BusinessCard
                            key={business.id || business._id || index}
                            business={{
                                ...business,
                                rating: business.rating || 3.5 + Math.random() * 1.5,
                            }}
                            variant="horizontal"
                            onPress={() => onPressBusiness(business.id || business._id)}
                            style={{ marginBottom: 12 }}
                        />
                    ))}
                </View>
            )}
        </View>
    )
})

HomeNearbyStores.propTypes = {
    businesses: PropTypes.array.isRequired,
    onPressBusiness: PropTypes.func.isRequired,
}

export default HomeNearbyStores

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        paddingTop: 20,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    title: {
        ...typography.h4,
        color: colors.text,
    },
    list: {
        paddingHorizontal: 16,
    },
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#AAA',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    enableButton: {
        marginTop: 16,
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    enableButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
})
