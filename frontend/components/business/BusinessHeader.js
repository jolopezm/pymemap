import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { colors, spacing, borderRadius } from '../../styles/theme'

export default function BusinessHeader({ business, owner }) {
    return (
        <View>
            <Image
                source={
                    business?.profile_pic
                        ? { uri: business.profile_pic }
                        : require('../../assets/default-profile-pic.svg')
                }
                style={styles.profileImage}
                resizeMode="cover"
            />

            <Text style={styles.businessName}>
                {business?.name ?? 'Sin nombre'}
            </Text>

            <Text style={styles.ownerName}>
                {owner?.name ?? 'Sin nombre'}
            </Text>

            <Text style={styles.category}>
                {business?.category ?? 'Sin categoría'}
            </Text>

            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>
                {business?.description ?? 'Sin descripción'}
            </Text>

            <Text style={styles.sectionTitle}>Ubicación</Text>
            <Text style={styles.address}>
                {business?.address ?? 'Sin ubicación'}
            </Text>
        </View>
    )
}

BusinessHeader.propTypes = {
    business: PropTypes.shape({
        profile_pic: PropTypes.string,
        name: PropTypes.string,
        category: PropTypes.string,
        description: PropTypes.string,
        address: PropTypes.string,
    }),
    owner: PropTypes.shape({
        name: PropTypes.string,
    }),
}

const styles = StyleSheet.create({
    profileImage: {
        width: '100%',
        height: 200,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    businessName: {
        color: colors.textSecondary,
        fontSize: 24,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    ownerName: {
        color: colors.textSecondary,
        fontSize: 16,
        marginBottom: spacing.sm,
    },
    category: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primary,
        color: '#FFFFFF',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.pill,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    description: {
        color: '#555',
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    address: {
        color: '#555',
        marginBottom: spacing.sm,
    },
})
