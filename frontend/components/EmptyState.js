import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { colors, spacing, typography } from '../styles/theme'

/**
 * EmptyState - Componente para mostrar estados vacíos con ilustración
 */
export default function EmptyState({
    title = 'No hay resultados',
    message = 'Intenta ajustar los filtros o buscar algo diferente',
    icon = 'search-outline',
    iconColor = colors.textLight,
    style,
}) {
    return (
        <View 
            style={[styles.container, style]}
            accessibilityRole="text"
            accessibilityLabel={`${title}. ${message}`}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={80} color={iconColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    )
}

EmptyState.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    style: PropTypes.object,
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        minHeight: 300,
    },
    iconContainer: {
        marginBottom: spacing.lg,
        opacity: 0.5,
    },
    title: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 300,
    },
})
