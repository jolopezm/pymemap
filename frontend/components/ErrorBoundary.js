import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography, borderRadius } from '../styles/theme'
import logger from '../utils/logger'

/**
 * ErrorBoundary - Componente para capturar errores de React y evitar crashes
 * Envuelve componentes/pantallas para mostrar UI de error amigable
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error) {
        // Actualizar estado para mostrar UI de fallback
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        // Puedes registrar el error en un servicio como Sentry
        logger.error('ErrorBoundary capturó un error:', error, errorInfo)
        this.setState({
            error,
            errorInfo,
        })
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render() {
        if (this.state.hasError) {
            // UI de fallback personalizada
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={64}
                                color={colors.error}
                            />
                        </View>

                        <Text style={styles.title}>¡Algo salió mal!</Text>

                        <Text style={styles.message}>
                            {this.props.message ||
                                'Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta de nuevo.'}
                        </Text>

                        {__DEV__ && this.state.error && (
                            <View style={styles.errorDetails}>
                                <Text style={styles.errorTitle}>
                                    Detalles del error (solo en desarrollo):
                                </Text>
                                <Text style={styles.errorText}>
                                    {this.state.error.toString()}
                                </Text>
                                {this.state.errorInfo && (
                                    <Text style={styles.errorStack}>
                                        {this.state.errorInfo.componentStack}
                                    </Text>
                                )}
                            </View>
                        )}

                        <Pressable
                            style={styles.button}
                            onPress={this.handleReset}
                        >
                            <Ionicons
                                name="refresh"
                                size={20}
                                color={colors.white}
                            />
                            <Text style={styles.buttonText}>
                                Intentar de nuevo
                            </Text>
                        </Pressable>

                        {this.props.onReset && (
                            <Pressable
                                style={styles.secondaryButton}
                                onPress={this.props.onReset}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Volver al inicio
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            )
        }

        return this.props.children
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
    },
    iconContainer: {
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h1,
        color: colors.text,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    message: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    errorDetails: {
        width: '100%',
        backgroundColor: colors.backgroundSecondary,
        padding: spacing.md,
        borderRadius: borderRadius.card,
        marginBottom: spacing.lg,
        maxHeight: 200,
    },
    errorTitle: {
        ...typography.small,
        fontWeight: '600',
        color: colors.error,
        marginBottom: spacing.xs,
    },
    errorText: {
        ...typography.small,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    errorStack: {
        ...typography.small,
        color: colors.textSecondary,
        fontFamily: 'monospace',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.card,
        gap: spacing.xs,
        minWidth: 200,
    },
    buttonText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '600',
    },
    secondaryButton: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    secondaryButtonText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
})

export default ErrorBoundary
