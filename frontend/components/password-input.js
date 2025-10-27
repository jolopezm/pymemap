import React, { useState, useEffect } from 'react'
import { View, TextInput, Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { globalStyles } from '../styles/global'

/**
 * Componente de entrada de contraseña con toggle de visibilidad y validación
 * Compatible con iOS y Android
 * 
 * @param {Object} props - Props del componente
 * @param {string} props.value - Valor actual de la contraseña
 * @param {Function} props.onChangeText - Función que se ejecuta al cambiar el texto
 * @param {string} props.placeholder - Texto placeholder (default: "Contraseña")
 * @param {Object} props.style - Estilos adicionales para el container
 * @param {Object} props.inputStyle - Estilos adicionales para el TextInput
 * @param {boolean} props.showToggle - Mostrar botón de toggle (default: true)
 * @param {boolean} props.showRequirements - Mostrar requisitos de contraseña (default: false)
 * @param {string} props.confirmValue - Valor de confirmación de contraseña (para validar coincidencia)
 * @param {boolean} props.isConfirmField - Si este campo es de confirmación (default: false)
 * @param {string} props.eyeColor - Color del ícono del ojo (default: "#666")
 * @param {boolean} props.autoFocus - Auto focus del input (default: false)
 * @param {Function} props.onSubmitEditing - Función que se ejecuta al enviar
 * @param {Function} props.onValidationChange - Callback con el estado de validación
 */
export default function PasswordInput({
    value,
    onChangeText,
    placeholder = "Contraseña",
    style = {},
    inputStyle = {},
    showToggle = true,
    showRequirements = false,
    confirmValue = "",
    isConfirmField = false,
    eyeColor = "#666",
    autoFocus = false,
    onSubmitEditing,
    onValidationChange,
    ...props
}) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [requirements, setRequirements] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
    })
    const [passwordMatch, setPasswordMatch] = useState(true)

    // Validar requisitos de contraseña
    useEffect(() => {
        if (showRequirements && value) {
            const newRequirements = {
                minLength: value.length >= 8,
                hasUppercase: /[A-Z]/.test(value),
                hasLowercase: /[a-z]/.test(value),
                hasNumber: /\d/.test(value),
                hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
            }
            setRequirements(newRequirements)
            
            // Notificar el estado de validación al componente padre
            if (onValidationChange) {
                const isValid = Object.values(newRequirements).every(req => req)
                onValidationChange(isValid, newRequirements)
            }
        }
    }, [value, showRequirements, onValidationChange])

    // Validar coincidencia de contraseñas (para campo de confirmación)
    useEffect(() => {
        if (isConfirmField && confirmValue !== undefined) {
            const matches = value === confirmValue
            setPasswordMatch(matches)
            
            // Notificar al padre si las contraseñas coinciden
            if (onValidationChange) {
                onValidationChange(matches, { passwordMatch: matches })
            }
        }
    }, [value, confirmValue, isConfirmField, onValidationChange])

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible)
    }

    const RequirementItem = ({ met, text }) => (
        <View style={styles.requirementItem}>
            <Ionicons
                name={met ? "checkmark-circle" : "close-circle"}
                size={16}
                color={met ? "#4CAF50" : "#f44336"}
            />
            <Text style={[
                styles.requirementText,
                { color: met ? "#4CAF50" : "#666" }
            ]}>
                {text}
            </Text>
        </View>
    )

    // Determinar si la contraseña es válida (todos los requisitos cumplidos)
    const isPasswordValid = showRequirements && value && 
        Object.values(requirements).every(req => req)
    
    // Determinar el estilo del borde según el tipo de campo
    const getBorderStyle = () => {
        if (isConfirmField && value) {
            // Campo de confirmación: verde si coincide, rojo si no
            return passwordMatch ? styles.inputValid : styles.inputInvalid
        } else if (showRequirements && value) {
            // Campo principal con requisitos: verde si válido, rojo si inválido
            return isPasswordValid ? styles.inputValid : styles.inputInvalid
        }
        return null
    }

    return (
        <View style={[styles.container, style]}>
            <TextInput
                style={[
                    globalStyles.textField, 
                    styles.input, 
                    inputStyle,
                    getBorderStyle(),
                    { color: '#333' } // Forzar color del texto
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none" 
                autoFocus={autoFocus}
                onSubmitEditing={onSubmitEditing}
                {...props}
            />
            
            {showToggle && (
                <Pressable
                    style={styles.toggleButton}
                    onPress={togglePasswordVisibility}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                    accessibilityRole="button"
                >
                    <Ionicons
                        name={isPasswordVisible ? "eye-off" : "eye"}
                        size={24}
                        color={eyeColor}
                    />
                </Pressable>
            )}
            
            {showRequirements && value && (
                <View style={styles.requirementsContainer}>
                    <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
                    <RequirementItem 
                        met={requirements.minLength} 
                        text="Mínimo 8 caracteres" 
                    />
                    <RequirementItem 
                        met={requirements.hasUppercase} 
                        text="Al menos una mayúscula (A-Z)" 
                    />
                    <RequirementItem 
                        met={requirements.hasLowercase} 
                        text="Al menos una minúscula (a-z)" 
                    />
                    <RequirementItem 
                        met={requirements.hasNumber} 
                        text="Al menos un número (0-9)" 
                    />
                    <RequirementItem 
                        met={requirements.hasSpecialChar} 
                        text="Al menos un símbolo (!@#$%^&*)" 
                    />
                </View>
            )}
            
            {/* Mensaje de confirmación de contraseña */}
            {isConfirmField && value && (
                <View style={[
                    styles.matchIndicator,
                    passwordMatch ? styles.matchSuccess : styles.matchError
                ]}>
                    <Ionicons
                        name={passwordMatch ? "checkmark-circle" : "close-circle"}
                        size={18}
                        color={passwordMatch ? "#FFFFFF" : "#FFFFFF"}
                    />
                    <Text style={styles.matchText}>
                        {passwordMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = {
    container: {
        position: 'relative',
        width: '100%',
        marginBottom: 15,
    },
    input: {
        paddingRight: 50, // Espacio para el botón del ojo
        marginBottom: 0, // Evitar doble margin
    },
    toggleButton: {
        position: 'absolute',
        right: 15,
        top: 13, // Posición fija desde arriba (ajustada para minHeight: 50)
        zIndex: 1,
        padding: 5, // Área táctil más grande
    },
    requirementsContainer: {
        marginTop: 6,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        borderWidth: 0,
        shadowColor: '#6A4C93',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    requirementsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    requirementText: {
        fontSize: 11,
        marginLeft: 6,
        flex: 1,
    },
    inputValid: {
        borderColor: '#4CAF50',
        borderWidth: 2,
    },
    inputInvalid: {
        borderColor: '#f44336',
        borderWidth: 2,
    },
    matchIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    matchSuccess: {
        backgroundColor: '#4CAF50',
    },
    matchError: {
        backgroundColor: '#f44336',
    },
    matchText: {
        fontSize: 13,
        marginLeft: 8,
        fontWeight: '600',
        color: '#FFFFFF',
    }
}