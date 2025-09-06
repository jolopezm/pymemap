import React, { useState } from 'react'
import {
    View,
    Text,
    Button,
    Pressable,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import { handleLogin } from '../utils/handle-login'
import { User } from '../classes/user'
import globalStyles from '../styles/global'

export default function Login({ title, onPress }) {
    const [user, setUser] = useState(new User('', '', '', '', ''))
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { login: authLogin } = useAuth()

    const handleLoginPress = async () => {
        setError('')
        setLoading(true)

        try {
            // Usar la función utilitaria para validar y hacer login
            const result = await handleLogin(user.email, user.password)

            if (result.success) {
                // Si es exitoso, actualizar el contexto de autenticación
                await authLogin(user.email, user.password)
                router.push('/home')
            } else {
                // Si falla, mostrar el error
                setError(result.error)
            }
        } catch (error) {
            console.error('Error durante login:', error)
            setError('Error inesperado. Por favor intenta de nuevo.')
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
