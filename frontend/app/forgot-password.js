import { useState } from 'react'
import { useRouter } from 'expo-router'
import { View, Text, TextInput, Pressable } from 'react-native'
import { Toast } from 'toastify-react-native'
import { User } from '../classes/user'
import { sendAuthCode } from '../api/auth-service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { globalStyles } from '../styles/global'
import Button from '../components/button'
import DismissKeyboard from '../components/dismiss-keyboard'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'

export default function ForgotPassword() {
    const [user, setUser] = useState(new User())
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [isValidEmail, setIsValidEmail] = useState(false)

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleEmailChange = (email) => {
        setUser(prev => ({ ...prev, email }))
        setEmailError('')
        setError('')
        
        // Validar formato de email en tiempo real
        if (email.length > 0) {
            const isValid = validateEmail(email)
            setIsValidEmail(isValid)
            if (!isValid) {
                setEmailError('Formato de correo electrónico inválido')
            }
        } else {
            setIsValidEmail(false)
        }
    }

    const handleSubmit = async () => {
        setError('')
        setEmailError('')
        
        // Validar email
        if (!validateEmail(user.email)) {
            setEmailError('Por favor ingresa un correo electrónico válido')
            return
        }
        
        setLoading(true)
        try {
            const result = await sendAuthCode(user.email)
            const authData = { user: user, code: result.code }
            await AsyncStorage.setItem('authData', JSON.stringify(authData))
            Toast.success(
                'Código enviado correctamente. Revisa tu correo.',
                { duration: 4000 }
            )
            router.push({
                pathname: '/auth-code',
                params: { from: 'forgot-password' },
            })
        } catch (error) {
            console.error(
                'Error al enviar el correo de restablecimiento:',
                error
            )
            const errorMessage = error.response?.data?.detail || 
                                 error.message ||
                                 'El correo no está registrado o hubo un error'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DismissKeyboard>
            <LinearGradient
                colors={['#9B59B6', '#F8BBD9']}
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[globalStyles.gradientContainer, { paddingVertical: 30 }]}>
                            {/* Icono de contraseña olvidada */}
                            <View style={globalStyles.logoContainer}>
                                <Ionicons name="lock-closed" size={64} color="#FFFFFF" />
                            </View>

                            <Text style={globalStyles.title}>
                                Recuperar Contraseña
                            </Text>

                            <Text style={[globalStyles.subtitle, { marginBottom: 24 }]}>
                                Ingresa tu email registrado para recibir un código de verificación
                            </Text>

                            {/* Mensaje de error general */}
                            {error ? (
                                <View
                                    style={{
                                        backgroundColor: 'rgba(255, 59, 48, 0.15)',
                                        borderLeftWidth: 4,
                                        borderLeftColor: '#FF3B30',
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        borderRadius: 12,
                                        marginBottom: 20,
                                        width: '100%',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#FFFFFF',
                                            fontSize: 14,
                                            fontWeight: '600',
                                        }}
                                    >
                                        ⚠️ {error}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Campo Email con validación */}
                            <View style={{ width: '100%', marginBottom: 16 }}>
                                <TextInput
                                    placeholder="Correo electrónico"
                                    placeholderTextColor="#999"
                                    style={[
                                        globalStyles.textField,
                                        emailError && {
                                            borderWidth: 2,
                                            borderColor: '#FF3B30',
                                        },
                                        isValidEmail && user.email.length > 0 && {
                                            borderWidth: 2,
                                            borderColor: '#4CAF50',
                                        }
                                    ]}
                                    value={user.email}
                                    onChangeText={handleEmailChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onSubmitEditing={handleSubmit}
                                />
                                {emailError && user.email.length > 0 ? (
                                    <Text
                                        style={{
                                            color: '#FFFFFF',
                                            fontSize: 13,
                                            marginTop: 6,
                                            marginLeft: 4,
                                            fontWeight: '500',
                                        }}
                                    >
                                        {emailError}
                                    </Text>
                                ) : isValidEmail ? (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginTop: 6,
                                            marginLeft: 4,
                                        }}
                                    >
                                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                        <Text
                                            style={{
                                                color: '#FFFFFF',
                                                fontSize: 13,
                                                marginLeft: 6,
                                                fontWeight: '500',
                                            }}
                                        >
                                            Formato válido
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            <Button
                                title="Solicitar Código"
                                variant="primary"
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={!isValidEmail || loading}
                                style={{ marginBottom: 24 }}
                            />

                            {/* Botón para volver */}
                            <Pressable
                                onPress={() => router.back()}
                                style={({ pressed }) => ({
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 14,
                                    marginTop: 12,
                                    opacity: pressed ? 0.7 : 1,
                                })}
                            >
                                <Ionicons
                                    name="arrow-back-outline"
                                    size={20}
                                    color="#FFFFFF"
                                    style={{ marginRight: 8 }}
                                />
                                <Text
                                    style={{
                                        color: '#FFFFFF',
                                        fontSize: 15,
                                        fontWeight: '600',
                                        opacity: 0.9,
                                    }}
                                >
                                    Volver al inicio de sesión
                                </Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </DismissKeyboard>
    )
}
