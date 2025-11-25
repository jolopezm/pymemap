import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { colors, spacing, typography } from '../styles/theme'

/**
 * ErrorState - Componente para mostrar errores con opción de retry
 */
export default function ErrorState({
    title = 'Algo salió mal',
    message = 'No pudimos cargar el contenido. Verifica tu conexión e intenta nuevamente.',
    onRetry,
    retryText = 'Reintentar',
    icon = 'alert-circle-outline',
    style,
}) {
    return (
        <View 
            style={[styles.container, style]}
            accessibilityRole="alert"
            accessibilityLabel={`Error: ${title}. ${message}`}
        >
            <Ionicons name={icon} size={64} color={colors.error} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <Pressable
                    style={styles.button}
                    onPress={onRetry}
                    accessibilityRole="button"
                    accessibilityLabel={retryText}
                    accessibilityHint="Toca para intentar cargar el contenido nuevamente"
                >
                    <Ionicons name="refresh" size={20} color={colors.white} />
                    <Text style={styles.buttonText}>{retryText}</Text>
                </Pressable>
            )}
        </View>
    )
}

ErrorState.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    onRetry: PropTypes.func,
    retryText: PropTypes.string,
    icon: PropTypes.string,
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
    title: {
        ...typography.h3,
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        maxWidth: 300,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 8,
    },
    buttonText: {
        ...typography.button,
        color: colors.white,
    },
})
