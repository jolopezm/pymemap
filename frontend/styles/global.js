import { StyleSheet } from 'react-native'

// Paleta de colores basada en el mockup
export const colors = {
    primary: '#6A4C93', // Púrpura principal del botón
    primaryDark: '#553A7A', // Púrpura más oscuro para hover/pressed
    secondary: '#9B59B6', // Púrpura del degradado superior
    accent: '#F8BBD9', // Rosa del degradado inferior
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    gray: '#888888',
    textPrimary: '#FFFFFF', // Texto principal en fondo púrpura
    textSecondary: '#333333', // Texto secundario
}

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 20,
        fontFamily: 'inherit',
    },

    // Nuevo container para el degradado
    gradientContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 40,
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 40,
        textAlign: 'center',
        color: colors.textPrimary,
        letterSpacing: 0.5,
        // Sombra muy sutil para legibilidad sin ser agresiva
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 30,
        textAlign: 'center',
        color: colors.textPrimary,
        opacity: 0.95,
        // Sombra mínima, casi imperceptible
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 1,
    },

    textField: {
        minHeight: 50,
        backgroundColor: colors.white,
        borderWidth: 0,
        marginBottom: 16,
        width: '100%',
        paddingHorizontal: 16,
        borderRadius: 25,
        fontSize: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        placeholderTextColor: '#999999',
    },

    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 25,
        borderWidth: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        width: '100%',
        minHeight: 54,
        overflow: 'hidden', // Evita líneas extrañas en los bordes
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,

        // Variantes de botón
        secondary: {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 2.5,
            borderColor: 'rgba(255, 255, 255, 0.9)',
            overflow: 'hidden',
            shadowColor: 'rgba(255, 255, 255, 0.3)',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 4,
            backdropFilter: 'blur(10px)', // Efecto de cristal
        },

        outlineBlack: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(51, 51, 51, 0.2)',
            borderWidth: 1.5,
            overflow: 'hidden',
            shadowColor: 'rgba(0, 0, 0, 0.15)',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 3,
        },

        // Tamaños
        small: {
            paddingVertical: 12,
            paddingHorizontal: 20,
            minHeight: 44,
        },

        large: {
            paddingVertical: 20,
            paddingHorizontal: 32,
            minHeight: 64,
        },

        // Estado deshabilitado
        disabled: {
            backgroundColor: colors.gray,
            shadowOpacity: 0.1,
            elevation: 1,
        },

        // Estados legacy (mantener compatibilidad)
        red: {
            backgroundColor: '#ff4d4d',
        },
        yellow: {
            backgroundColor: '#ffe600ff',
        },
        green: {
            backgroundColor: '#4dff88',
        },
    },

    buttonText: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.8,
        textAlign: 'center',
    },

    buttonTextSecondary: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.6,
    },

    buttonTextOutline: {
        color: colors.textSecondary,
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    buttonTextSmall: {
        fontSize: 16,
        fontWeight: '500',
    },

    buttonTextLarge: {
        fontSize: 20,
        fontWeight: '700',
    },

    buttonTextDisabled: {
        color: colors.lightGray,
        opacity: 0.7,
    },

    buttonText: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    buttonTextSecondary: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '500',
    },

    linkText: {
        color: colors.textPrimary,
        fontSize: 16,
        textDecorationLine: 'underline',
        opacity: 0.95,
        // Sombra muy ligera para links
        textShadowColor: 'rgba(0, 0, 0, 0.08)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 1,
        fontWeight: '500',
    },

    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 40,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },

    card: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
    },

    badge: {
        backgroundColor: '#eee',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 12,
        textAlign: 'center',
    },
})
