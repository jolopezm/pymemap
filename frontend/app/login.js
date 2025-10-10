import { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable, TextInput } from 'react-native'
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

export default function Login() {
    const [user, setUser] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
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
            e =
                e.response?.data?.detail ||
                'Credenciales incorrectas o error de servidor.'
            setError(e)
            Toast.error(e, { duration: 3000 })
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
                <View style={globalStyles.gradientContainer}>
                {/* Icono de la app */}
                <View style={globalStyles.logoContainer}>
                    <Ionicons name="business" size={64} color="#FFFFFF" />
                </View>

                {/* Título */}
                <Text style={globalStyles.title}>¡Bienvenido!</Text>

                {/* Campo Email */}
                <TextInput
                    placeholder="Correo electrónico"
                    placeholderTextColor="#999"
                    style={globalStyles.textField}
                    value={user.email}
                    onChangeText={email => setUser({ ...user, email })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {/* Campo Contraseña */}
                <PasswordInput
                    placeholder="Contraseña"
                    value={user.password}
                    onChangeText={password => setUser({ ...user, password })}
                    onSubmitEditing={handleLoginPress}
                    style={{ marginBottom: 20 }}
                />

                {/* Link Olvidaste contraseña */}
                <Link href="/forgot-password" style={{ marginBottom: 30 }}>
                    <Text style={globalStyles.linkText}>¿Olvidaste tu contraseña?</Text>
                </Link>

                {/* Botón Principal */}
                <Button
                    title="Ingresar"
                    variant="primary"
                    onPress={handleLoginPress}
                    loading={loading}
                    style={{ marginBottom: 10 }}
                />

                {/* Botón Secundario */}
                <Text style={[globalStyles.linkText, { marginTop: 20, marginBottom: 10 }]}>
                    ¿No tienes cuenta?
                </Text>
                <Button
                    title="Registrarse"
                    variant="secondary"
                    onPress={() => router.push('/sign-in')}
                />

                {/* Botón de navegación al home */}
                <Button
                    title="🏠 Explorar sin cuenta"
                    variant="outline"
                    onPress={() => router.push('/home')}
                    style={{ 
                        marginTop: 30,
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                />
            </View>
        </LinearGradient>
    </DismissKeyboard>
    )
}
