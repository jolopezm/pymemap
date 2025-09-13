import { useState, useEffect, useRef } from 'react'
import {
    View,
    Text,
    Pressable,
    TextInput,
    ActivityIndicator,
} from 'react-native'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import { handleLogin } from '../utils/handle-login'
import { handleAutoLogin } from '../utils/auto-login' // Importar la nueva función
import { User } from '../classes/user'
import globalStyles from '../styles/global'
import { Toast } from 'toastify-react-native'

export default function Login() {
    const [user, setUser] = useState(new User('', '', '', '', ''))
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const params = useLocalSearchParams()
    const router = useRouter()
    const { login: authLogin } = useAuth()
    const autoLoginAttempted = useRef(false) // Ref to track if auto-login was tried

    useEffect(() => {
        // Check if we have params and if we haven't tried to auto-login yet
        if (params.email && params.password && !autoLoginAttempted.current) {
            // Mark that we are attempting auto-login
            autoLoginAttempted.current = true
            handleAutoLogin(params, setLoading, setError, authLogin, router)
        }
    }, [params, authLogin, router]) // Keep dependencies, but the ref prevents re-triggering

    const handleLoginPress = async (
        email = user.email,
        password = user.password
    ) => {
        setError('')
        setLoading(true)

        try {
            const result = await handleLogin(email, password)

            if (result.success) {
                await authLogin(email, password)
                router.push('/home')
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error inesperado. Por favor intenta de nuevo.')
        } finally {
            setLoading(false)
            if (error) {
                Toast.error(error, { duration: 3000 })
            }
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
