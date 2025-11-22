import React from 'react'
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native'
import PropTypes from 'prop-types'
import { SearchBar, LocationHeader } from '../ui'
import { FilterChips } from '../business'
import { colors, spacing, borderRadius } from '../../styles/theme'

export default function StoresHeader({
    userLocation,
    userCoords,
    activeView,
    selectedFilters,
    onLocationPress,
    onSearchPress,
    onViewChange,
    onFilterChange,
    onSortPress,
    onCategoriesPress,
}) {
    return (
        <View>
            {/* Header con ubicación y búsqueda */}
            <View style={styles.header}>
                <LocationHeader 
                    location={userLocation}
                    onPress={onLocationPress}
                />
                <SearchBar 
                    editable={false}
                    onPress={onSearchPress}
                />
            </View>

            {/* Tabs: Mapa / Lista */}
            <View style={styles.tabsContainer}>
                {Platform.OS !== 'web' && (
                    <Pressable 
                        style={[styles.tab, activeView === 'map' && styles.tabActive]}
                        onPress={() => onViewChange('map')}
                    >
                        <Text style={[styles.tabText, activeView === 'map' && styles.tabTextActive]}>
                            Mapa
                        </Text>
                    </Pressable>
                )}
                <Pressable 
                    style={[styles.tab, activeView === 'list' && styles.tabActive]}
                    onPress={() => onViewChange('list')}
                >
                    <Text style={[styles.tabText, activeView === 'list' && styles.tabTextActive]}>
                        Lista
                    </Text>
                </Pressable>
            </View>

            {/* Filtros rápidos */}
            <View style={styles.filtersContainer}>
                <FilterChips
                    filters={selectedFilters}
                    onFilterChange={onFilterChange}
                    onSortPress={onSortPress}
                    onCategoriesPress={onCategoriesPress}
                    showDistanceFilters={!!userCoords}
                />
            </View>
        </View>
    )
}

StoresHeader.propTypes = {
    userLocation: PropTypes.string,
    userCoords: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
    }),
    activeView: PropTypes.oneOf(['list', 'map']).isRequired,
    selectedFilters: PropTypes.shape({
        domicilio: PropTypes.bool,
        categories: PropTypes.arrayOf(PropTypes.string),
        recoger: PropTypes.bool,
        distance: PropTypes.number,
    }).isRequired,
    onLocationPress: PropTypes.func.isRequired,
    onSearchPress: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onSortPress: PropTypes.func.isRequired,
    onCategoriesPress: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: borderRadius.medium,
        backgroundColor: colors.backgroundLight,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    tabTextActive: {
        color: colors.white,
    },
    filtersContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
})
