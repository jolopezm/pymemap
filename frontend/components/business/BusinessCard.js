import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import PropTypes from 'prop-types'
import {
    colors,
    spacing,
    borderRadius,
    shadows,
    typography,
} from '../../styles/theme'
import RatingDisplay from '../ui/RatingDisplay'
import OptimizedImage from '../OptimizedImage'
import HapticPressable from '../ui/HapticPressable'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BusinessCard = React.memo(function BusinessCard({
    business,
    onPress,
    variant = 'vertical',
    width,
    imageHeight,
    showBadge = false,
    badgeText = 'Nuevo',
    showDistance = true,
    showRating = true,
    showCategory = true,
    showFavorite = false,
    onFavoritePress,
    showLogo = false,
    extraInfo,
    style,
}) {
    const [ownerImage, setOwnerImage] = React.useState(null)

    const cardStyle = [
        styles.card,
        variant === 'horizontal' && styles.cardHorizontal,
        variant === 'compact' && styles.cardCompact,
        width && { width },
        style,
    ]

    const imageContainerStyle = [
        styles.imageContainer,
        variant === 'horizontal' && styles.imageHorizontal,
        imageHeight && { height: imageHeight },
    ]

    React.useEffect(() => {
        const getOwnerFromCache = async () => {
            try {
                const data = await AsyncStorage.getItem('@other_users_data')
                if (data) {
                    const parsedData = JSON.parse(data)
                    const users = Object.values(parsedData)

                    const owner = users.find(
                        u =>
                            (u._id && u._id === business.owner_id) ||
                            (u.id && u.id === business.owner_id)
                    )
                    if (owner?.profile_pic) {
                        setOwnerImage(owner.profile_pic)
                    }
                }
            } catch (error) {}
        }

        getOwnerFromCache()
    }, [business.owner_id])

    return (
        <HapticPressable
            style={cardStyle}
            onPress={onPress}
            hapticStyle="light"
            accessibilityRole="button"
            accessibilityLabel={`Ver perfil de ${business.name}`}
            accessibilityHint="Abre los detalles del negocio"
        >
            {/* Badge */}
            {showBadge && (
                <View style={styles.badge}>
                    {badgeText === 'Nuevo' && (
                        <Ionicons
                            name="sparkles"
                            size={12}
                            color={colors.primary}
                        />
                    )}
                    <Text style={styles.badgeText}>{badgeText}</Text>
                </View>
            )}

            {/* Botón de favoritos */}
            {showFavorite && (
                <HapticPressable
                    style={styles.favoriteButton}
                    onPress={e => {
                        e.stopPropagation()
                        onFavoritePress?.()
                    }}
                    hapticStyle="medium"
                    accessibilityRole="button"
                    accessibilityLabel={`Marcar ${business.name} como favorito`}
                    accessibilityHint="Agrega o quita de tus favoritos"
                >
                    <Ionicons
                        name="heart-outline"
                        size={20}
                        color={colors.text}
                    />
                </HapticPressable>
            )}

            {/* Imagen */}
            <View style={imageContainerStyle}>
                {business.profile_pic ? (
                    <OptimizedImage
                        source={{ uri: business.profile_pic }}
                        style={styles.image}
                        resizeMode="cover"
                        placeholderIcon="storefront"
                    />
                ) : (
                    <LinearGradient
                        colors={[colors.backgroundLight, colors.backgroundGray]}
                        style={styles.imagePlaceholder}
                    >
                        <Ionicons
                            name="storefront"
                            size={variant === 'horizontal' ? 40 : 50}
                            color={colors.primary}
                        />
                    </LinearGradient>
                )}
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {business.name}
                </Text>

                {showCategory && (
                    <Text style={styles.category} numberOfLines={1}>
                        {business.category || 'General'}
                    </Text>
                )}

                <View style={styles.meta}>
                    {showRating && (
                        <RatingDisplay
                            rating={business.rating}
                            size="small"
                            showNumber={true}
                        />
                    )}

                    {showDistance && business.distanceText && (
                        <View style={styles.distance}>
                            <Ionicons
                                name="location"
                                size={12}
                                color={colors.textSecondary}
                            />
                            <Text style={styles.distanceText}>
                                {business.distanceText}
                            </Text>
                        </View>
                    )}
                </View>
                {extraInfo}
            </View>

            {showLogo && (
                <View style={styles.logoContainer}>
                    {ownerImage || business.User?.profile_pic ? (
                        <OptimizedImage
                            source={{
                                uri: ownerImage || business.User?.profile_pic,
                            }}
                            style={styles.logoImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={[colors.primary, colors.primaryDark]}
                            style={styles.logo}
                        >
                            <Text style={styles.logoText}>
                                {(business.User?.name || business.name)
                                    .substring(0, 2)
                                    .toUpperCase()}
                            </Text>
                        </LinearGradient>
                    )}
                </View>
            )}
        </HapticPressable>
    )
})

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.card,
        overflow: 'visible',
        ...shadows.card,
    },

    cardHorizontal: {
        flexDirection: 'row',
    },

    cardCompact: {
        overflow: 'hidden',
    },

    badge: {
        position: 'absolute',
        top: spacing.sm + 2,
        left: spacing.sm + 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: spacing.xs + 2,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },

    badgeText: {
        fontSize: typography.small.fontSize,
        fontWeight: '700',
        color: colors.primary,
    },
    imageContainer: {
        width: '100%',
        height: 160,
        borderTopLeftRadius: borderRadius.card,
        borderTopRightRadius: borderRadius.card,
        overflow: 'hidden',
    },

    imageHorizontal: {
        width: 90,
        height: 90,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: borderRadius.medium,
    },

    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    info: {
        padding: spacing.md,
    },

    name: {
        ...typography.body,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 3,
        lineHeight: 18,
    },

    category: {
        ...typography.small,
        color: colors.textLight,
        marginBottom: spacing.sm,
    },

    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    distance: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },

    distanceText: {
        ...typography.small,
        color: colors.textSecondary,
        fontWeight: '600',
    },

    favoriteButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        ...shadows.subtle,
    },

    logoContainer: {
        position: 'absolute',
        bottom: spacing.md,
        right: spacing.md,
        width: 60,
        height: 60,
        borderRadius: 30,
        ...shadows.elevated,
    },

    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.white,
    },

    logoText: {
        ...typography.h3,
        color: colors.white,
    },

    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        borderWidth: 3,
        borderColor: colors.white,
    },
})

BusinessCard.propTypes = {
    business: PropTypes.shape({
        id: PropTypes.string,
        _id: PropTypes.string,
        name: PropTypes.string.isRequired,
        category: PropTypes.string,
        profile_pic: PropTypes.string,
        rating: PropTypes.number,
        distance: PropTypes.number,
        distanceText: PropTypes.string,
    }).isRequired,
    onPress: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['vertical', 'horizontal', 'compact']),
    width: PropTypes.number,
    imageHeight: PropTypes.number,
    showBadge: PropTypes.bool,
    badgeText: PropTypes.string,
    showDistance: PropTypes.bool,
    showRating: PropTypes.bool,
    showCategory: PropTypes.bool,
    showFavorite: PropTypes.bool,
    onFavoritePress: PropTypes.func,
    showLogo: PropTypes.bool,
    extraInfo: PropTypes.node,
    style: PropTypes.object,
}

export default BusinessCard
