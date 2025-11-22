import { View, Image, StyleSheet, Animated } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'

/**
 * OptimizedImage - Componente de imagen con lazy loading, placeholder y animaciones
 * 
 * Features:
 * - Lazy loading automático
 * - Placeholder mientras carga
 * - Fade-in suave al cargar
 * - Manejo de errores con fallback
 * - Optimización de memoria
 */
export default function OptimizedImage({
    source,
    style,
    placeholder = 'default',
    placeholderIcon = 'image-outline',
    placeholderColors = ['#F5F5F5', '#E8E8E8'],
    fallbackIcon = 'alert-circle-outline',
    resizeMode = 'cover',
    fadeDuration = 300,
    onLoad,
    onError,
    ...props
}) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        // Reset states cuando cambia el source
        setLoading(true)
        setError(false)
        fadeAnim.setValue(0)
    }, [source])

    const handleLoad = () => {
        setLoading(false)
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: fadeDuration,
            useNativeDriver: true,
        }).start()
        onLoad?.()
    }

    const handleError = e => {
        setLoading(false)
        setError(true)
        onError?.(e)
    }

    // Determinar si hay fuente válida
    const hasValidSource = source && (typeof source === 'object' ? source.uri : true)

    return (
        <View style={[styles.container, style]}>
            {/* Placeholder / Error State */}
            {(loading || error || !hasValidSource) && (
                <LinearGradient
                    colors={placeholderColors}
                    style={styles.placeholder}
                >
                    <Ionicons
                        name={error ? fallbackIcon : placeholderIcon}
                        size={32}
                        color={error ? '#F44336' : '#9B59B6'}
                    />
                </LinearGradient>
            )}

            {/* Imagen real */}
            {hasValidSource && !error && (
                <Animated.View
                    style={[
                        styles.imageContainer,
                        { opacity: fadeAnim },
                    ]}
                >
                    <Image
                        source={source}
                        style={[styles.image, style]}
                        resizeMode={resizeMode}
                        onLoad={handleLoad}
                        onError={handleError}
                        {...props}
                    />
                </Animated.View>
            )}
        </View>
    )
}

OptimizedImage.propTypes = {
    source: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({ uri: PropTypes.string }),
    ]),
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    placeholder: PropTypes.string,
    placeholderIcon: PropTypes.string,
    placeholderColors: PropTypes.arrayOf(PropTypes.string),
    fallbackIcon: PropTypes.string,
    resizeMode: PropTypes.oneOf(['cover', 'contain', 'stretch', 'center']),
    fadeDuration: PropTypes.number,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
    },
    placeholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    image: {
        width: '100%',
        height: '100%',
    },
})
