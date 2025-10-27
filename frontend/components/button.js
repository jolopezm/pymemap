import React from 'react'
import { Pressable, Text, ActivityIndicator } from 'react-native'
import { globalStyles } from '../styles/global'

/**
 * Componente de botón profesional con efectos interactivos
 * Compatible con iOS y Android
 * 
 * @param {Object} props - Props del componente
 * @param {string} props.title - Texto del botón
 * @param {Function} props.onPress - Función que se ejecuta al presionar
 * @param {'primary'|'secondary'|'outline'} props.variant - Variante del botón (default: 'primary')
 * @param {boolean} props.loading - Mostrar spinner de carga (default: false)
 * @param {boolean} props.disabled - Deshabilitar botón (default: false)
 * @param {Object} props.style - Estilos adicionales para el botón
 * @param {Object} props.textStyle - Estilos adicionales para el texto
 * @param {string} props.size - Tamaño del botón: 'small', 'medium', 'large' (default: 'medium')
 */
export default function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style = {},
    textStyle = {},
    size = 'medium',
    ...props
}) {
    const getButtonStyle = (pressed) => {
        const baseStyle = [globalStyles.button]
        
        // Variantes de estilo
        switch (variant) {
            case 'secondary':
                baseStyle.push(globalStyles.button.secondary)
                break
            case 'outline':
                baseStyle.push(globalStyles.button.outlineBlack)
                break
            default:
                // primary es el estilo base
                break
        }

        // Tamaños
        switch (size) {
            case 'small':
                baseStyle.push(globalStyles.button.small)
                break
            case 'large':
                baseStyle.push(globalStyles.button.large)
                break
            default:
                // medium es el estilo base
                break
        }

        // Estados interactivos
        if (pressed && !disabled) {
            switch (variant) {
                case 'secondary':
                    baseStyle.push({
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        borderColor: 'rgba(255, 255, 255, 1)',
                        transform: [{ scale: 0.97 }],
                        opacity: 0.95,
                    })
                    break
                case 'outline':
                    baseStyle.push({
                        backgroundColor: 'rgba(240, 240, 240, 1)',
                        borderColor: 'rgba(51, 51, 51, 0.3)',
                        transform: [{ scale: 0.97 }],
                        opacity: 0.95,
                    })
                    break
                default:
                    baseStyle.push({
                        backgroundColor: '#7B5BA1',
                        transform: [{ scale: 0.97 }],
                        shadowOpacity: 0.5,
                        elevation: 8,
                    })
                    break
            }
        }

        // Estado deshabilitado
        if (disabled) {
            baseStyle.push(globalStyles.button.disabled)
        }

        // Estilos personalizados
        baseStyle.push(style)

        return baseStyle
    }

    const getTextStyle = () => {
        const baseTextStyle = [globalStyles.buttonText]
        
        switch (variant) {
            case 'secondary':
                baseTextStyle.push(globalStyles.buttonTextSecondary)
                break
            case 'outline':
                baseTextStyle.push(globalStyles.buttonTextOutline)
                break
        }

        switch (size) {
            case 'small':
                baseTextStyle.push(globalStyles.buttonTextSmall)
                break
            case 'large':
                baseTextStyle.push(globalStyles.buttonTextLarge)
                break
        }

        if (disabled) {
            baseTextStyle.push(globalStyles.buttonTextDisabled)
        }

        baseTextStyle.push(textStyle)
        
        return baseTextStyle
    }

    return (
        <Pressable
            style={({ pressed }) => getButtonStyle(pressed)}
            onPress={onPress}
            disabled={disabled || loading}
            accessibilityRole="button"
            accessibilityLabel={title}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </Pressable>
    )
}