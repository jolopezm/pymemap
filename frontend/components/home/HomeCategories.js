import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { colors, spacing, shadows } from '../../styles/theme'
import HapticPressable from '../ui/HapticPressable'

const CATEGORIES = [
    { id: 1, name: 'Todos', icon: 'apps-outline', color: '#9B59B6' },
    { id: 2, name: 'Comida', icon: 'restaurant-outline', color: '#FF6B6B' },
    { id: 3, name: 'Servicios', icon: 'construct-outline', color: '#4ECDC4' },
    { id: 4, name: 'Retail', icon: 'cart-outline', color: '#FFD93D' },
    { id: 5, name: 'Salud', icon: 'fitness-outline', color: '#06FFA5' },
    { id: 6, name: 'Belleza', icon: 'cut-outline', color: '#FFC2D1' },
    { id: 7, name: 'Educación', icon: 'school-outline', color: '#A8E6CF' },
    { id: 8, name: 'Hogar', icon: 'home-outline', color: '#F4A261' },
]

const HomeCategories = React.memo(function HomeCategories({ selectedCategory, onSelectCategory, categorySize }) {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {CATEGORIES.map(category => (
                    <HapticPressable
                        key={category.id}
                        style={[
                            styles.item,
                            selectedCategory === category.name && styles.itemActive,
                        ]}
                        onPress={() => {
                            const newCategory =
                                selectedCategory === category.name ? null : category.name
                            onSelectCategory(newCategory)
                        }}
                        hapticStyle="selection"
                        accessibilityRole="button"
                        accessibilityLabel={`Filtrar por ${category.name}`}
                        accessibilityHint={
                            selectedCategory === category.name
                                ? 'Toca para quitar el filtro'
                                : 'Toca para filtrar negocios por esta categoría'
                        }
                        accessibilityState={{
                            selected: selectedCategory === category.name,
                        }}
                    >
                        <View
                            style={[
                                styles.icon,
                                {
                                    width: categorySize,
                                    height: categorySize,
                                    borderRadius: categorySize / 2,
                                    backgroundColor: category.color,
                                },
                                selectedCategory === category.name && styles.iconActive,
                            ]}
                        >
                            <Ionicons name={category.icon} size={20} color="#FFF" />
                        </View>
                        <Text
                            style={[
                                styles.label,
                                selectedCategory === category.name && styles.labelActive,
                            ]}
                        >
                            {category.name}
                        </Text>
                    </HapticPressable>
                ))}
            </ScrollView>
        </View>
    )
})

HomeCategories.propTypes = {
    selectedCategory: PropTypes.string,
    onSelectCategory: PropTypes.func.isRequired,
    categorySize: PropTypes.number.isRequired,
}

export default HomeCategories

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        paddingTop: 14,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    scroll: {
        paddingHorizontal: spacing.md,
    },
    item: {
        alignItems: 'center',
        paddingHorizontal: 6,
        marginRight: 8,
    },
    itemActive: {},
    icon: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 7,
        ...shadows.subtle,
    },
    iconActive: {
        transform: [{ scale: 1.1 }],
        ...shadows.card,
    },
    label: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    labelActive: {
        color: colors.primary,
        fontWeight: '700',
    },
})
