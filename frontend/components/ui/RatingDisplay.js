import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { colors, typography, spacing } from '../../styles/theme'


const RatingDisplay = React.memo(function RatingDisplay({
    rating,
    reviewCount,
    size = 'medium',
    showStars = false,
    showNumber = true,
    showCount = false,
    starColor = '#FFB800',
    style,
    textStyle,
}) {
    // Configuración por tamaño
    const sizeConfig = {
        small: { iconSize: 12, fontSize: typography.small.fontSize },
        medium: { iconSize: 14, fontSize: typography.body.fontSize },
        large: { iconSize: 16, fontSize: typography.body.fontSize },
    }

    const config = sizeConfig[size] || sizeConfig.medium

    // Si no hay rating, mostrar "Nuevo"
    if (!rating || rating === 0) {
        return (
            <View style={[styles.container, style]}>
                {showStars && (
                    <Ionicons
                        name="star-outline"
                        size={config.iconSize}
                        color={colors.textSecondary}
                    />
                )}
                <Text style={[styles.newText, { fontSize: config.fontSize }, textStyle]}>
                    Nuevo
                </Text>
            </View>
        )
    }

    // Mostrar estrellas individuales
    if (showStars) {
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

        return (
            <View style={[styles.container, style]}>
                <View style={styles.starsContainer}>
                    {/* Estrellas llenas */}
                    {[...Array(fullStars)].map((_, i) => (
                        <Ionicons
                            key={`full-${i}`}
                            name="star"
                            size={config.iconSize}
                            color={starColor}
                        />
                    ))}
                    
                    {/* Media estrella */}
                    {hasHalfStar && (
                        <Ionicons
                            name="star-half"
                            size={config.iconSize}
                            color={starColor}
                        />
                    )}
                    
                    {/* Estrellas vacías */}
                    {[...Array(emptyStars)].map((_, i) => (
                        <Ionicons
                            key={`empty-${i}`}
                            name="star-outline"
                            size={config.iconSize}
                            color={starColor}
                        />
                    ))}
                </View>

                {/* Número de calificación */}
                {showNumber && (
                    <Text style={[styles.ratingText, { fontSize: config.fontSize }, textStyle]}>
                        {rating.toFixed(1)}
                    </Text>
                )}

                {/* Contador de reseñas */}
                {showCount && reviewCount > 0 && (
                    <Text style={[styles.countText, { fontSize: config.fontSize }, textStyle]}>
                        ({reviewCount})
                    </Text>
                )}
            </View>
        )
    }

    // Mostrar solo número con icono
    return (
        <View style={[styles.container, style]}>
            <Ionicons
                name="star"
                size={config.iconSize}
                color={starColor}
            />
            <Text style={[styles.ratingText, { fontSize: config.fontSize }, textStyle]}>
                {rating.toFixed(1)}
            </Text>
            {showCount && reviewCount > 0 && (
                <Text style={[styles.countText, { fontSize: config.fontSize }, textStyle]}>
                    ({reviewCount})
                </Text>
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs - 2,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
    },
    ratingText: {
        color: colors.text,
        fontWeight: '600',
    },
    countText: {
        color: colors.textSecondary,
        fontWeight: '400',
    },
    newText: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
})

RatingDisplay.propTypes = {
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showStars: PropTypes.bool,
    showNumber: PropTypes.bool,
    showCount: PropTypes.bool,
    starColor: PropTypes.string,
    style: PropTypes.object,
    textStyle: PropTypes.object,
}

export default RatingDisplay
