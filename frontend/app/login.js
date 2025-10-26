import { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import globalStyles from '../styles/global'
import { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LoadingSpinner from '../components/loading-spinner'
import Screen from '../components/screen'
import PasswordInput from '../components/password-input'
import Button from '../components/button'
import DismissKeyboard from '../components/dismiss-keyboard'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Login() {
    const [user, setUser] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { login } = useAuth()
    const autoLoginAttempted = useRef(false)

    useEffect(() => {
        const autoLogin = async () => {
            const authData = await AsyncStorage.getItem('authData')
            const parsedData = authData ? JSON.parse(authData) : {}
            const { email, password } = parsedData.user || {}

            if (email && password && !autoLoginAttempted.current) {
                autoLoginAttempted.current = true

                setLoading(true)
                try {
                    await login({ email, password })
                    router.push('/home')
                    Toast.success('Haz iniciado sesión exitosamente', {
                        duration: 3000,
                    })
                } catch (e) {
                    Toast.error(
                        'No se pudo iniciar sesión automáticamente. Por favor, inicia sesión manualmente.',
                        { duration: 3000 }
                    )
                } finally {
                    setLoading(false)
                }
            }
        }

        autoLogin()
    }, [login, router])

    const handleLoginPress = async () => {
        setError('')
        setEmailError('')
        
        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(user.email)) {
            setEmailError('Por favor ingresa un correo electrónico válido')
            return
        }

        if (user.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            await login({ email: user.email, password: user.password })
            const authData = await AsyncStorage.getItem('authData')
            if (authData) {
                const parsedData = JSON.parse(authData)

                if (parsedData.user) {
                    delete parsedData.user.password
                }

                await AsyncStorage.setItem(
                    'authData',
                    JSON.stringify(parsedData)
                )
            }
            router.push('/home')
        } catch (e) {
            const errorMessage =
                e.response?.data?.detail ||
                'Credenciales incorrectas o error de servidor.'
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
                        contentContainerStyle={{ 
                            flexGrow: 1,
                            justifyContent: 'center',
                            paddingHorizontal: 30,
                            paddingVertical: 20,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ width: '100%', alignItems: 'center' }}>
                        {/* Icono de la app */}
                        <View style={[globalStyles.logoContainer, { marginBottom: 20 }]}>
                            <Ionicons
                                name="business"
                                size={56}
                                color="#FFFFFF"
                            />
                        </View>

                        {/* Título */}
                        <Text style={[globalStyles.title, { fontSize: 28, marginBottom: 8 }]}>
                            ¡Bienvenido de nuevo!
                        </Text>
                        
                        {/* Subtítulo */}
                        <Text style={[globalStyles.subtitle, { marginBottom: 24 }]}>
                            Inicia sesión para continuar
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

                        {/* Campo Email */}
                        <TextInput
                            placeholder="Correo electrónico"
                            placeholderTextColor="#999"
                            style={[
                                globalStyles.textField,
                                emailError && {
                                    borderWidth: 2,
                                    borderColor: '#FF3B30',
                                }
                            ]}
                            value={user.email}
                            onChangeText={email => {
                                setUser({ ...user, email })
                                setEmailError('')
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {emailError ? (
                            <Text
                                style={{
                                    color: '#FFFFFF',
                                    fontSize: 13,
                                    marginTop: -10,
                                    marginBottom: 10,
                                    marginLeft: 4,
                                    fontWeight: '500',
                                }}
                            >
                                {emailError}
                            </Text>
                        ) : null}

                        {/* Campo Contraseña */}
                        <PasswordInput
                            placeholder="Contraseña"
                            value={user.password}
                            onChangeText={password => setUser({ ...user, password })}
                            onSubmitEditing={handleLoginPress}
                            style={{ marginBottom: 8 }}
                        />

                        {/* Link Olvidaste contraseña */}
                        <Link href="/forgot-password" style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
                            <Text
                                style={{
                                    color: '#FFFFFF',
                                    fontSize: 13,
                                    fontWeight: '500',
                                    opacity: 0.85,
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </Text>
                        </Link>

                        {/* Botón Principal */}
                        <Button
                            title="Ingresar"
                            variant="primary"
                            onPress={handleLoginPress}
                            loading={loading}
                            disabled={!user.email || !user.password}
                            style={{ marginBottom: 20 }}
                        />

                        {/* Divider */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 20,
                                width: '100%',
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    height: 1,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                }}
                            />
                            <Text
                                style={{
                                    marginHorizontal: 15,
                                    color: '#FFFFFF',
                                    fontSize: 14,
                                    fontWeight: '600',
                                    opacity: 0.9,
                                }}
                            >
                                ¿Primera vez aquí?
                            </Text>
                            <View
                                style={{
                                    flex: 1,
                                    height: 1,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                }}
                            />
                        </View>

                        {/* Botón Secundario */}
                        <Button
                            title="Crear cuenta nueva"
                            variant="secondary"
                            onPress={() => router.push('/sign-in')}
                            style={{ marginBottom: 12 }}
                        />

                        {/* Botón de navegación al home */}
                        <Pressable
                            onPress={() => router.push('/(tabs)/home')}
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
                                name="compass-outline"
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
                                Explorar sin cuenta
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    </DismissKeyboard>
    )
}
