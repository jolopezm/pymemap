import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import PropTypes from 'prop-types'
import { BusinessCard } from '../business'
import { colors, spacing, typography } from '../../styles/theme'

const HomeNewBusinesses = React.memo(function HomeNewBusinesses({
    businesses,
    onPressBusiness,
    cardWidth,
    cardImageHeight,
}) {
    const newBusinesses = businesses.slice(0, 3)

    if (newBusinesses.length === 0) return null

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Nuevos en PyMap</Text>
                <Pressable>
                    <Text style={styles.seeMore}>Ver más</Text>
                </Pressable>
            </View>
            <Text style={styles.subtitle}>
                Descubre los nuevos negocios en PyMap
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                snapToInterval={240}
                decelerationRate="fast"
            >
                {newBusinesses.map((business, index) => (
                    <BusinessCard
                        key={business.id || business._id || index}
                        business={{
                            ...business,
                            rating: business.rating || 0,
                        }}
                        variant="vertical"
                        width={cardWidth}
                        imageHeight={cardImageHeight}
                        showBadge={true}
                        onPress={() => onPressBusiness(business.id || business._id)}
                    />
                ))}
            </ScrollView>
        </View>
    )
})

HomeNewBusinesses.propTypes = {
    businesses: PropTypes.array.isRequired,
    onPressBusiness: PropTypes.func.isRequired,
    cardWidth: PropTypes.number.isRequired,
    cardImageHeight: PropTypes.number.isRequired,
}

export default HomeNewBusinesses

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    title: {
        ...typography.h4,
        color: colors.text,
    },
    seeMore: {
        fontSize: 14,
        color: '#9B59B6',
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        paddingHorizontal: 16,
        marginBottom: 14,
        fontWeight: '500',
    },
    scroll: {
        paddingHorizontal: 12,
        gap: 12,
    },
})
