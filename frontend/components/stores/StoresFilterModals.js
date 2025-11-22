import React, { useEffect } from 'react'
import { View, Text, Pressable, Modal, Animated, ScrollView, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, shadows } from '../../styles/theme'

const sortOptions = [
    { id: 1, label: 'Recomendados', icon: 'star-outline' },
    { id: 2, label: 'Más cercanos', icon: 'location-outline' },
    { id: 3, label: 'Mejor calificados', icon: 'trophy-outline' },
    { id: 4, label: 'Más populares', icon: 'trending-up-outline' },
    { id: 5, label: 'Nuevos', icon: 'sparkles-outline' },
]

const categoryOptions = [
    { id: 1, label: 'Comida', icon: 'fast-food-outline' },
    { id: 2, label: 'Servicios', icon: 'construct-outline' },
    { id: 3, label: 'Retail', icon: 'bag-outline' },
    { id: 4, label: 'Salud', icon: 'medkit-outline' },
    { id: 5, label: 'Belleza', icon: 'cut-outline' },
    { id: 6, label: 'Educación', icon: 'school-outline' },
    { id: 7, label: 'Hogar', icon: 'home-outline' },
    { id: 8, label: 'Tecnología', icon: 'phone-portrait-outline' },
]

export default function StoresFilterModals({
    showSortModal,
    showCategoriesModal,
    sortOption,
    selectedCategories,
    slideAnim,
    fadeAnim,
    onSortSelect,
    onCategoryToggle,
    onCloseSortModal,
    onCloseCategoriesModal,
}) {
    useEffect(() => {
        if (showSortModal) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 20,
                    bounciness: 0,
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 300,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [showSortModal, fadeAnim, slideAnim])

    return (
        <>
            {/* Modal de ordenar */}
            <Modal
                visible={showSortModal}
                transparent={true}
                animationType="none"
                onRequestClose={onCloseSortModal}
            >
                <Animated.View 
                    style={[styles.modalOverlay, { opacity: fadeAnim }]}
                >
                    <Pressable 
                        style={styles.modalOverlayTouchable}
                        onPress={onCloseSortModal}
                    />
                    <Animated.View 
                        style={[
                            styles.modalContent,
                            { transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ordenar por</Text>
                            <Pressable onPress={onCloseSortModal}>
                                <Ionicons name="close" size={24} color="#333" />
                            </Pressable>
                        </View>

                        <View style={styles.sortOptions}>
                            {sortOptions.map((option) => (
                                <Pressable
                                    key={option.id}
                                    style={[
                                        styles.sortOption,
                                        sortOption === option.label && styles.sortOptionActive
                                    ]}
                                    onPress={() => onSortSelect(option.label)}
                                >
                                    <View style={styles.sortOptionContent}>
                                        <Ionicons 
                                            name={option.icon} 
                                            size={20} 
                                            color={sortOption === option.label ? colors.primary : colors.textSecondary} 
                                        />
                                        <Text style={[
                                            styles.sortOptionText,
                                            sortOption === option.label && styles.sortOptionTextActive
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </View>
                                    {sortOption === option.label && (
                                        <Ionicons name="checkmark" size={24} color={colors.primary} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Modal de categorías */}
            <Modal
                visible={showCategoriesModal}
                transparent={true}
                animationType="fade"
                onRequestClose={onCloseCategoriesModal}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={onCloseCategoriesModal}
                >
                    <Pressable 
                        style={styles.modalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Categorías</Text>
                            <Pressable onPress={onCloseCategoriesModal}>
                                <Ionicons name="close" size={24} color="#333" />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.categoryOptions}>
                            {categoryOptions.map((category) => (
                                <Pressable
                                    key={category.id}
                                    style={[
                                        styles.categoryOption,
                                        selectedCategories.includes(category.label) && styles.categoryOptionActive
                                    ]}
                                    onPress={() => onCategoryToggle(category.label)}
                                >
                                    <View style={styles.categoryOptionContent}>
                                        <Ionicons 
                                            name={category.icon} 
                                            size={20} 
                                            color={selectedCategories.includes(category.label) ? colors.primary : colors.textSecondary} 
                                        />
                                        <Text style={[
                                            styles.categoryOptionText,
                                            selectedCategories.includes(category.label) && styles.categoryOptionTextActive
                                        ]}>
                                            {category.label}
                                        </Text>
                                    </View>
                                    {selectedCategories.includes(category.label) && (
                                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    )
}

StoresFilterModals.propTypes = {
    showSortModal: PropTypes.bool.isRequired,
    showCategoriesModal: PropTypes.bool.isRequired,
    sortOption: PropTypes.string.isRequired,
    selectedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
    slideAnim: PropTypes.object.isRequired,
    fadeAnim: PropTypes.object.isRequired,
    onSortSelect: PropTypes.func.isRequired,
    onCategoryToggle: PropTypes.func.isRequired,
    onCloseSortModal: PropTypes.func.isRequired,
    onCloseCategoriesModal: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalOverlayTouchable: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xlarge,
        borderTopRightRadius: borderRadius.xlarge,
        paddingBottom: spacing.xxl,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    sortOptions: {
        padding: spacing.lg,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.sm,
        backgroundColor: colors.backgroundLight,
    },
    sortOptionActive: {
        backgroundColor: colors.backgroundPurple,
    },
    sortOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    sortOptionText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    sortOptionTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    categoryOptions: {
        padding: spacing.lg,
    },
    categoryOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.sm,
        backgroundColor: colors.backgroundLight,
    },
    categoryOptionActive: {
        backgroundColor: colors.backgroundPurple,
    },
    categoryOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    categoryOptionText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    categoryOptionTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
})
