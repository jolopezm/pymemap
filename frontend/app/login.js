import React, { useState, useEffect, useRef } from 'react'
import {
    View,
    Text,
    Pressable,
    TextInput,
    ActivityIndicator,
} from 'react-native'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
// No necesitamos importar 'login' desde el servicio aquí, usaremos el del contexto
import { useAuth } from '../context/auth-context'
import globalStyles from '../styles/global'
import { Toast } from 'toastify-react-native'

export default function Login() {
    const [user, setUser] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const params = useLocalSearchParams()
    const router = useRouter()
    // 1. Corregir el nombre de la función extraída del contexto
    const { login } = useAuth()
    const autoLoginAttempted = useRef(false)

    useEffect(() => {
        const { email, password } = params

        if (email && password && !autoLoginAttempted.current) {
            autoLoginAttempted.current = true

            const performAutoLogin = async () => {
                try {
                    // 2. Usar el nombre correcto de la función
                    await login({ email, password })
                    router.push('/home')
                } catch (error) {
                    console.error('El auto-login falló:', error)
                    setError('El auto-login falló. Inicia sesión manualmente.')
                }
            }

            performAutoLogin()
        }
    }, [params, login, router])

    // 3. Simplificar la función de login manual
    const handleLoginPress = async () => {
        setError('')
        setLoading(true)

        try {
            // Usamos directamente la función 'login' del contexto
            await login({ email: user.email, password: user.password })
            router.push('/home')
        } catch (e) {
            const errorMessage =
                e.response?.data?.detail ||
                'Credenciales incorrectas o error de servidor.'
            setError(errorMessage)
            Toast.error(errorMessage, { duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Iniciar Sesión</Text>

            <TextInput
                placeholder="Email"
                style={globalStyles.textField}
                value={user.email}
                onChangeText={email => setUser({ ...user, email })}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Contraseña"
                style={globalStyles.textField}
                value={user.password}
                onChangeText={password => setUser({ ...user, password })}
                secureTextEntry
            />

            {error ? (
                <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
            ) : null}

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Pressable
                    style={globalStyles.button}
                    onPress={handleLoginPress}
                >
                    <Text style={{ color: '#fff' }}>Confirmar</Text>
                </Pressable>
            )}

            <Text style={{ marginTop: 20 }}>¿No tienes cuenta?</Text>
            <Pressable
                style={globalStyles.button}
                onPress={() => router.push('/sign-in')}
            >
                <Text style={{ color: '#fff' }}>Registrarse</Text>
            </Pressable>

            <Link href="/home">
                <Text style={{ color: 'blue' }}>Ir a home</Text>
            </Link>
        </View>
    )
}
