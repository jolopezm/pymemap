import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { RatingDisplay } from '../ui'
import { colors, spacing, borderRadius, shadows } from '../../styles/theme'

export default function BusinessReviews({ reviews }) {
    if (reviews.length === 0) {
        return (
            <View>
                <Text style={styles.sectionTitle}>Reseñas</Text>
                <Text style={styles.noReviews}>No hay reseñas aún.</Text>
            </View>
        )
    }

    return (
        <View>
            <Text style={styles.sectionTitle}>Reseñas</Text>
            {reviews.map((review, index) => (
                <View key={index} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                        <Text style={styles.userName}>
                            {review.userName || 'Anónimo'}
                        </Text>
                        <RatingDisplay
                            rating={review.rating || 5}
                            size="medium"
                            showStars={true}
                            showNumber={false}
                        />
                    </View>
                    <Text style={styles.comment}>
                        {review.comment || 'Sin comentarios'}
                    </Text>
                </View>
            ))}
        </View>
    )
}

BusinessReviews.propTypes = {
    reviews: PropTypes.arrayOf(
        PropTypes.shape({
            userName: PropTypes.string,
            rating: PropTypes.number,
            comment: PropTypes.string,
        })
    ).isRequired,
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    noReviews: {
        color: '#666',
        marginBottom: spacing.md,
    },
    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    userName: {
        fontWeight: '600',
        fontSize: 16,
        color: colors.textSecondary,
    },
    comment: {
        color: '#666',
        fontSize: 14,
        lineHeight: 20,
    },
})
