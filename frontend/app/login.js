import { useState, useEffect, useRef } from 'react'
import {
    View,
    Text,
    Pressable,
    TextInput,
    ActivityIndicator,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import globalStyles from '../styles/global'
import { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
