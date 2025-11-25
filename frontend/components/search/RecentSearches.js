import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import PropTypes from 'prop-types'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius } from '../../styles/theme'

export default function RecentSearches({ searches = [], onSelectSearch, onClear }) {
    if (searches.length === 0) return null

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Búsquedas recientes</Text>
                <Pressable onPress={onClear}>
                    <Text style={styles.clearButton}>Limpiar</Text>
                </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
                {searches.map((search, index) => (
                    <Pressable
                        key={index}
                        style={styles.chip}
                        onPress={() => onSelectSearch(search)}
                    >
                        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.chipText}>{search}</Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}

RecentSearches.propTypes = {
    searches: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelectSearch: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    clearButton: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    list: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.backgroundLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
    },
    chipText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
})
