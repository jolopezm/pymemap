import React from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { colors, spacing, borderRadius, typography } from '../../styles/theme'


const FilterChips = React.memo(function FilterChips({
    filters = {},
    onFilterChange,
    onSortPress,
    onCategoriesPress,
    onOwnersPress,
    showDistanceFilters = false,
}) {
    const toggleFilter = (key) => {
        onFilterChange({
            ...filters,
            [key]: !filters[key],
        })
    }

    const setDistanceFilter = (distance) => {
        const newDistance = filters.distance === distance ? null : distance
        onFilterChange({
            ...filters,
            distance: newDistance,
        })
    }

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {/* Ordenar */}
                <Pressable style={styles.chip} onPress={onSortPress}>
                    <Ionicons name="swap-vertical-outline" size={14} color={colors.text} />
                    <Text style={styles.chipText}>Ordenar</Text>
                </Pressable>

                {/* Categorías */}
                <Pressable
                    style={[
                        styles.chip,
                        filters.categories?.length > 0 && styles.chipActive,
                    ]}
                    onPress={onCategoriesPress}
                >
                    <Ionicons
                        name="grid-outline"
                        size={14}
                        color={filters.categories?.length > 0 ? colors.white : colors.text}
                    />
                    <Text
                        style={[
                            styles.chipText,
                            filters.categories?.length > 0 && styles.chipTextActive,
                        ]}
                    >
                        Categorías{' '}
                        {filters.categories?.length > 0 && `(${filters.categories.length})`}
                    </Text>
                </Pressable>

                {/* Vendedor */}
                <Pressable
                    style={[
                        styles.chip,
                        filters.owners?.length > 0 && styles.chipActive
                    ]}
                    onPress={onOwnersPress}
                >
                    <Ionicons
                        name="person-outline"
                        size={14}
                        color={filters.owners?.length > 0 ? colors.white : colors.text}
                    />
                    <Text
                        style={[
                            styles.chipText,
                            filters.owners?.length > 0 && styles.chipTextActive
                        ]}
                    >
                        Vendedor
                        {filters.owners?.length > 0 && ` (${filters.owners.length})`}
                    </Text>
                </Pressable>

                {/* Filtros de distancia */}
                {showDistanceFilters && (
                    <>
                        <Pressable
                            style={[styles.chip, filters.distance === 1 && styles.chipActive]}
                            onPress={() => setDistanceFilter(1)}
                        >
                            <Ionicons
                                name="navigate-outline"
                                size={14}
                                color={filters.distance === 1 ? colors.white : colors.text}
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    filters.distance === 1 && styles.chipTextActive,
                                ]}
                            >
                                Menos de 1 km
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[styles.chip, filters.distance === 3 && styles.chipActive]}
                            onPress={() => setDistanceFilter(3)}
                        >
                            <Ionicons
                                name="navigate-outline"
                                size={14}
                                color={filters.distance === 3 ? colors.white : colors.text}
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    filters.distance === 3 && styles.chipTextActive,
                                ]}
                            >
                                Menos de 3 km
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[styles.chip, filters.distance === 5 && styles.chipActive]}
                            onPress={() => setDistanceFilter(5)}
                        >
                            <Ionicons
                                name="navigate-outline"
                                size={14}
                                color={filters.distance === 5 ? colors.white : colors.text}
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    filters.distance === 5 && styles.chipTextActive,
                                ]}
                            >
                                Menos de 5 km
                            </Text>
                        </Pressable>
                    </>
                )}
            </ScrollView>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },

    scroll: {
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        gap: spacing.xs + 2,
    },

    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.card,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },

    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    chipText: {
        fontSize: typography.small.fontSize,
        color: colors.text,
        fontWeight: '500',
    },

    chipTextActive: {
        color: colors.white,
    },
})

export default FilterChips
