import React from 'react'
import { View, Text, Pressable, Image, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { formatDistance } from '../../utils/geolocation'
import { colors, spacing, borderRadius, shadows } from '../../styles/theme'

export default function SearchResults({ results, userCoords, onSelectResult }) {
    if (results.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={colors.border} />
                <Text style={styles.emptyText}>No se encontraron resultados</Text>
                <Text style={styles.emptySubtext}>
                    Intenta con otras palabras clave
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.resultsCount}>
                {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </Text>
            {results.map((result, index) => (
                <Pressable
                    key={index}
                    style={styles.resultCard}
                    onPress={() => onSelectResult(result)}
                >
                    <View style={styles.imageContainer}>
                        {result.data.profile_pic ? (
                            <Image
                                source={{ uri: result.data.profile_pic }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <LinearGradient
                                colors={[colors.backgroundPurple, '#E8D5FF']}
                                style={styles.imagePlaceholder}
                            >
                                <Ionicons
                                    name="storefront-outline"
                                    size={32}
                                    color={colors.primary}
                                />
                            </LinearGradient>
                        )}
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.name} numberOfLines={1}>
                            {result.data.name}
                        </Text>
                        <Text style={styles.category} numberOfLines={1}>
                            {result.data.category || 'Servicios'}
                        </Text>
                        {result.data.distance !== undefined && userCoords && (
                            <View style={styles.distance}>
                                <Ionicons
                                    name="location"
                                    size={14}
                                    color={colors.primary}
                                />
                                <Text style={styles.distanceText}>
                                    {formatDistance(result.data.distance)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textLight}
                    />
                </Pressable>
            ))}
        </View>
    )
}

SearchResults.propTypes = {
    results: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string.isRequired,
            data: PropTypes.shape({
                id: PropTypes.string,
                _id: PropTypes.string,
                name: PropTypes.string,
                category: PropTypes.string,
                profile_pic: PropTypes.string,
                distance: PropTypes.number,
            }).isRequired,
        })
    ).isRequired,
    userCoords: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
    }),
    onSelectResult: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxxl * 2,
        paddingHorizontal: spacing.xl,
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
    },
    resultsCount: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.card,
    },
    imageContainer: {
        marginRight: spacing.md,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.small,
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.small,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    category: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    distance: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    distanceText: {
        fontSize: 13,
        color: colors.textLight,
    },
})
