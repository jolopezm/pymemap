import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography, borderRadius } from '../styles/theme'
import logger from '../utils/logger'

class FeatureErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        const { featureName } = this.props
        logger.error(`Error en feature "${featureName}":`, error, errorInfo)

        this.setState({
            error,
            errorInfo,
        })

        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })

        if (this.props.onRetry) {
            this.props.onRetry()
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback({
                    error: this.state.error,
                    retry: this.handleRetry,
                })
            }

            return (
                <View style={styles.container}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={64}
                        color={colors.error}
                    />
                    <Text style={styles.title}>
                        {this.props.errorTitle || 'Algo salió mal'}
                    </Text>
                    <Text style={styles.message}>
                        {this.props.errorMessage ||
                            `Ocurrió un error en ${this.props.featureName}. Por favor, intenta nuevamente.`}
                    </Text>

                    <Pressable
                        style={styles.retryButton}
                        onPress={this.handleRetry}
                    >
                        <Ionicons
                            name="refresh-outline"
                            size={20}
                            color={colors.white}
                        />
                        <Text style={styles.retryText}>Reintentar</Text>
                    </Pressable>

                    {__DEV__ && this.state.error && (
                        <View style={styles.errorDetails}>
                            <Text style={styles.errorDetailsText}>
                                {this.state.error.toString()}
                            </Text>
                        </View>
                    )}
                </View>
            )
        }

        return this.props.children
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: typography.h3.fontSize,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: typography.body.fontSize,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.button,
        gap: spacing.xs,
    },
    retryText: {
        color: colors.white,
        fontSize: typography.body.fontSize,
        fontWeight: '600',
    },
    errorDetails: {
        marginTop: spacing.xl,
        padding: spacing.md,
        backgroundColor: colors.errorLight || '#FFEBEE',
        borderRadius: borderRadius.card,
        maxWidth: '100%',
    },
    errorDetailsText: {
        fontSize: typography.small.fontSize,
        color: colors.error,
        fontFamily: 'monospace',
    },
})

export default FeatureErrorBoundary

export function withErrorBoundary(Component, featureName, options = {}) {
    return function WrappedComponent(props) {
        return (
            <FeatureErrorBoundary featureName={featureName} {...options}>
                <Component {...props} />
            </FeatureErrorBoundary>
        )
    }
}
