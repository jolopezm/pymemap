import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import PropTypes from 'prop-types'
import { colors, spacing, shadows, typography } from '../../styles/theme'
import OptimizedImage from '../OptimizedImage'

const HomeFeaturedBrands = React.memo(function HomeFeaturedBrands({ businesses, onPressBusiness, featuredSize }) {
    const featured = businesses.slice(0, 6)

    if (featured.length === 0) return null

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Destacados en tu zona</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                decelerationRate="fast"
            >
                {featured.map((business, index) => (
                    <Pressable
                        key={business.id || business._id || index}
                        style={styles.circle}
                        onPress={() => onPressBusiness(business.id || business._id)}
                    >
                        <View
                            style={[
                                styles.logo,
                                {
                                    width: featuredSize,
                                    height: featuredSize,
                                    borderRadius: featuredSize / 2,
                                },
                            ]}
                        >
                            {business.profile_pic ? (
                                <OptimizedImage
                                    source={{ uri: business.profile_pic }}
                                    style={styles.logoImage}
                                    resizeMode="cover"
                                    placeholderIcon="storefront"
                                />
                            ) : (
                                <LinearGradient
                                    colors={['#F5F5F5', '#E8E8E8']}
                                    style={styles.logoPlaceholder}
                                >
                                    <Ionicons
                                        name="storefront"
                                        size={32}
                                        color="#9B59B6"
                                    />
                                </LinearGradient>
                            )}
                        </View>
                        <Text style={styles.name} numberOfLines={2}>
                            {business.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
})

HomeFeaturedBrands.propTypes = {
    businesses: PropTypes.array.isRequired,
    onPressBusiness: PropTypes.func.isRequired,
    featuredSize: PropTypes.number.isRequired,
}

export default HomeFeaturedBrands

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    title: {
        ...typography.h4,
        color: colors.text,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm + 2,
    },
    scroll: {
        paddingHorizontal: spacing.lg,
    },
    circle: {
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    logo: {
        overflow: 'hidden',
        ...shadows.elevated,
        marginBottom: spacing.sm,
        backgroundColor: colors.white,
        borderWidth: 2.5,
        borderColor: colors.primary,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    logoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        ...typography.small,
        color: colors.text,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 14,
    },
})
