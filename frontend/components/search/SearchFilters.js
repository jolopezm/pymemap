import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import PropTypes from 'prop-types'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius } from '../../styles/theme'

const quickClicks = [
    { id: 0, label: 'Cerca de mí', icon: 'location-outline', isNearby: true },
    { id: 1, label: 'Servicios', icon: 'construct-outline', searchQuery: 'servicios' },
    { id: 2, label: 'Belleza', icon: 'cut-outline', searchQuery: 'belleza' },
    { id: 3, label: 'Salud', icon: 'medkit-outline', searchQuery: 'salud' },
    { id: 4, label: 'Comida', icon: 'restaurant-outline', searchQuery: 'comida' },
    { id: 5, label: 'Retail', icon: 'bag-outline', searchQuery: 'retail' },
    { id: 6, label: 'Educación', icon: 'school-outline', searchQuery: 'educación' },
]

export default function SearchFilters({ nearbyFilter, onToggleNearby, onQuickSearch, userCoords }) {
    const visibleClicks = quickClicks.filter(click => {
        if (click.isNearby && !userCoords) return false
        return true
    })

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Búsquedas rápidas</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {visibleClicks.map(click => {
                    const isActive = click.isNearby && nearbyFilter
                    return (
                        <Pressable
                            key={click.id}
                            style={[styles.chip, isActive && styles.chipActive]}
                            onPress={() => {
                                if (click.isNearby) {
                                    onToggleNearby()
                                } else if (click.searchQuery) {
                                    onQuickSearch(click.searchQuery)
                                }
                            }}
                        >
                            <Ionicons
                                name={click.icon}
                                size={18}
                                color={isActive ? colors.white : colors.primary}
                            />
                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                {click.label}
                            </Text>
                        </Pressable>
                    )
                })}
            </ScrollView>
        </View>
    )
}

SearchFilters.propTypes = {
    nearbyFilter: PropTypes.bool.isRequired,
    onToggleNearby: PropTypes.func.isRequired,
    onQuickSearch: PropTypes.func.isRequired,
    userCoords: PropTypes.object,
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.backgroundPurple,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    chipActive: {
        backgroundColor: colors.primary,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
    },
    chipTextActive: {
        color: colors.white,
    },
})
