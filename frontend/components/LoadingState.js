import React from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import PropTypes from 'prop-types'
import { colors, spacing, borderRadius, shadows } from '../styles/theme'

/**
 * LoadingState - Skeleton screens para mejor UX durante cargas
 * 
 * Variantes:
 * - card: Para BusinessCard (vertical u horizontal)
 * - list: Para listas de negocios
 * - detail: Para perfil detallado de negocio
 */
export default function LoadingState({ variant = 'card', count = 1, style }) {
    const shimmerAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [shimmerAnim])

    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    })

    const renderSkeleton = () => {
        switch (variant) {
            case 'card':
                return <SkeletonCard shimmerOpacity={shimmerOpacity} />
            case 'horizontal':
                return <SkeletonHorizontalCard shimmerOpacity={shimmerOpacity} />
            case 'list':
                return (
                    <View>
                        {Array.from({ length: count }).map((_, i) => (
                            <SkeletonHorizontalCard key={i} shimmerOpacity={shimmerOpacity} />
                        ))}
                    </View>
                )
            case 'detail':
                return <SkeletonDetail shimmerOpacity={shimmerOpacity} />
            default:
                return <SkeletonCard shimmerOpacity={shimmerOpacity} />
        }
    }

    return (
        <View style={[styles.container, style]} accessibilityLabel="Cargando contenido">
            {renderSkeleton()}
        </View>
    )
}

// Skeleton para BusinessCard vertical
function SkeletonCard({ shimmerOpacity }) {
    return (
        <View style={styles.card}>
            <Animated.View style={[styles.cardImage, { opacity: shimmerOpacity }]}>
                <LinearGradient
                    colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                />
            </Animated.View>
            <View style={styles.cardInfo}>
                <Animated.View style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}>
                    <LinearGradient
                        colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
                <Animated.View style={[styles.skeletonSubtitle, { opacity: shimmerOpacity }]}>
                    <LinearGradient
                        colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
            </View>
        </View>
    )
}

// Skeleton para BusinessCard horizontal
function SkeletonHorizontalCard({ shimmerOpacity }) {
    return (
        <View style={styles.horizontalCard}>
            <Animated.View style={[styles.horizontalImage, { opacity: shimmerOpacity }]}>
                <LinearGradient
                    colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                />
            </Animated.View>
            <View style={styles.horizontalInfo}>
                <Animated.View style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}>
                    <LinearGradient
                        colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
                <Animated.View style={[styles.skeletonSubtitle, { opacity: shimmerOpacity }]}>
                    <LinearGradient
                        colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
            </View>
        </View>
    )
}

// Skeleton para detalle de negocio
function SkeletonDetail({ shimmerOpacity }) {
    return (
        <View style={styles.detail}>
            <Animated.View style={[styles.detailImage, { opacity: shimmerOpacity }]}>
                <LinearGradient
                    colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                />
            </Animated.View>
            <View style={styles.detailInfo}>
                <Animated.View style={[styles.skeletonTitle, { opacity: shimmerOpacity, width: '60%' }]}>
                    <LinearGradient
                        colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
                <Animated.View style={[styles.skeletonSubtitle, { opacity: shimmerOpacity, width: '40%' }]}>
                    <LinearGradient
                        colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
                <Animated.View style={[styles.skeletonParagraph, { opacity: shimmerOpacity }]}>
                    <LinearGradient
                        colors={[colors.backgroundLight, colors.backgroundGray, colors.backgroundLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
            </View>
        </View>
    )
}

LoadingState.propTypes = {
    variant: PropTypes.oneOf(['card', 'horizontal', 'list', 'detail']),
    count: PropTypes.number,
    style: PropTypes.object,
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    gradient: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    // Card vertical
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.card,
        overflow: 'hidden',
        ...shadows.card,
        marginBottom: spacing.md,
    },
    cardImage: {
        width: '100%',
        height: 160,
        backgroundColor: colors.backgroundLight,
    },
    cardInfo: {
        padding: spacing.md,
    },

    // Card horizontal
    horizontalCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: borderRadius.card,
        overflow: 'hidden',
        ...shadows.card,
        marginBottom: spacing.md,
    },
    horizontalImage: {
        width: 90,
        height: 90,
        backgroundColor: colors.backgroundLight,
    },
    horizontalInfo: {
        flex: 1,
        padding: spacing.md,
    },

    // Detail
    detail: {
        backgroundColor: colors.white,
    },
    detailImage: {
        width: '100%',
        height: 250,
        backgroundColor: colors.backgroundLight,
    },
    detailInfo: {
        padding: spacing.lg,
    },

    // Skeleton elementos
    skeletonTitle: {
        height: 18,
        borderRadius: 4,
        marginBottom: spacing.sm,
        backgroundColor: colors.backgroundLight,
        overflow: 'hidden',
    },
    skeletonSubtitle: {
        height: 14,
        borderRadius: 4,
        marginBottom: spacing.sm,
        backgroundColor: colors.backgroundLight,
        overflow: 'hidden',
        width: '70%',
    },
    skeletonParagraph: {
        height: 60,
        borderRadius: 4,
        marginTop: spacing.md,
        backgroundColor: colors.backgroundLight,
        overflow: 'hidden',
    },
})
