import React from 'react'
import { Pressable, Keyboard, Platform } from 'react-native'

/**
 * Componente wrapper que oculta el teclado cuando se toca fuera de los inputs
 * Funciona tanto en iOS como Android y es compatible con web
 * 
 * @param {Object} props - Props del componente
 * @param {ReactNode} props.children - Componentes hijos que serán envueltos
 * @param {Object} props.style - Estilos adicionales para el contenedor
 * @param {boolean} props.disabled - Deshabilitar funcionalidad de dismiss (default: false)
 * @param {Function} props.onPress - Función adicional que se ejecuta al tocar (opcional)
 */
export default function DismissKeyboard({ 
    children, 
    style = { flex: 1 }, 
    disabled = false,
    onPress,
    ...props 
}) {
    const handlePress = () => {
        // Solo dismiss en plataformas móviles
        if (!disabled && Platform.OS !== 'web') {
            Keyboard.dismiss()
        }
        
        // Ejecutar función adicional si se proporciona
        if (onPress) {
            onPress()
        }
    }

    return (
        <Pressable 
            style={style} 
            onPress={handlePress}
            accessible={false}
            // En web, no interceptar eventos para mantener funcionalidad normal
            pointerEvents={Platform.OS === 'web' ? 'box-none' : 'auto'}
            {...props}
        >
            {children}
        </Pressable>
    )
}