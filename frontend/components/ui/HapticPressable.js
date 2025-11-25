import React from 'react'
import { Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import PropTypes from 'prop-types'

/**
 * Pressable con feedback háptico integrado
 * Proporciona retroalimentación táctil automática en interacciones
 */
const HapticPressable = ({ 
    onPress, 
    hapticStyle = 'light',
    disabled = false,
    children,
    style,
    ...pressableProps 
}) => {
    const handlePress = (event) => {
        if (!disabled) {
            // Ejecutar haptic feedback según el estilo
            switch (hapticStyle) {
                case 'light':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    break
                case 'medium':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    break
                case 'heavy':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                    break
                case 'selection':
                    Haptics.selectionAsync()
                    break
                case 'success':
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                    break
                case 'warning':
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
                    break
                case 'error':
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                    break
                default:
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
            
            // Ejecutar callback original
            onPress?.(event)
        }
    }

    // Agregar feedback visual (scale 0.95) cuando presionado
    const getStyle = ({ pressed }) => {
        if (typeof style === 'function') {
            return [
                style({ pressed }),
                pressed && !disabled && {
                    transform: [{ scale: 0.95 }],
                    opacity: 0.8,
                }
            ]
        }
        return [
            style,
            pressed && !disabled && {
                transform: [{ scale: 0.95 }],
                opacity: 0.8,
            }
        ]
    }

    return (
        <Pressable
            {...pressableProps}
            style={getStyle}
            onPress={handlePress}
            disabled={disabled}
        >
            {children}
        </Pressable>
    )
}

HapticPressable.propTypes = {
    onPress: PropTypes.func,
    hapticStyle: PropTypes.oneOf([
        'light',
        'medium',
        'heavy',
        'selection',
        'success',
        'warning',
        'error',
    ]),
    disabled: PropTypes.bool,
    children: PropTypes.node,
}

export default HapticPressable
