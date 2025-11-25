import { View, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { colors } from '../styles/theme'

/**
 * OptimizedImage - Componente de imagen usando expo-image para caching y performance
 */
export default function OptimizedImage({
    source,
    style,
    placeholder = 'default',
    placeholderIcon = 'image-outline',
    placeholderColors = ['#F5F5F5', '#E8E8E8'],
    fallbackIcon = 'alert-circle-outline',
    resizeMode = 'cover',
    transition = 300,
    onLoad,
    onError,
    ...props
}) {
    // Normalizar source para expo-image
    const imageSource = typeof source === 'object' && source.uri ? source.uri : source

    return (
        <View style={[styles.container, style]}>
            <Image
                source={imageSource}
                style={[styles.image, StyleSheet.absoluteFill]}
                contentFit={resizeMode}
                transition={transition}
                onLoad={onLoad}
                onError={onError}
                placeholder={null} // Usamos nuestro propio placeholder si falla
                {...props}
            />
            
            {/* Fallback visual si no hay source o si falla (expo-image maneja el loading visualmente bien, 
                pero podemos mantener el gradiente de fondo para cuando no hay imagen) */}
            {!imageSource && (
                <LinearGradient
                    colors={placeholderColors}
                    style={styles.placeholder}
                >
                    <Ionicons
                        name={placeholderIcon}
                        size={32}
                        color={'#9B59B6'}
                    />
                </LinearGradient>
            )}
        </View>
    )
}

OptimizedImage.propTypes = {
    source: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({ uri: PropTypes.string }),
        PropTypes.string,
    ]),
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    placeholder: PropTypes.string,
    placeholderIcon: PropTypes.string,
    placeholderColors: PropTypes.arrayOf(PropTypes.string),
    fallbackIcon: PropTypes.string,
    resizeMode: PropTypes.oneOf(['cover', 'contain', 'stretch', 'center']),
    transition: PropTypes.number,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        position: 'relative',
    },
    placeholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
})
