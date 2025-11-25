import { useState, useEffect } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { resetPassword } from '../api/user-service'
import { globalStyles } from '../styles/global'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../context/auth-context'
import { Toast } from 'toastify-react-native'
import Screen from '../components/screen'
import PasswordInput from '../components/password-input'

export default function ResetPassword() {
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const router = useRouter()
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const getEmailFromStorage = async () => {
            const authData = await AsyncStorage.getItem('authData')
            if (authData) {
                const parsedData = JSON.parse(authData)
                setEmail(parsedData.user?.email || '')
            }
        }
        getEmailFromStorage()
    }, [])

    const handleResetPassword = async () => {
        setError('')
        if (newPassword !== confirmNewPassword) {
            setError('Las contraseñas no coinciden')
            return
        }
        setLoading(true)
        try {
            await resetPassword({ email, new_password: newPassword })
            await login({ email, password: newPassword })
            await AsyncStorage.removeItem('authData')
            Toast.success('Contraseña restablecida y sesión iniciada.', {
                duration: 3000,
            })
            router.push('/home')
        } catch (err) {
            const errorMessage =
                err.response?.data?.detail ||
                'Error al restablecer la contraseña'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Screen>
            <PasswordInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nueva Contraseña"
                showRequirements={true}
                style={{ marginBottom: 20 }}
            />
            <PasswordInput
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Confirmar Nueva Contraseña"
                isConfirmField={true}
                confirmValue={newPassword}
                style={{ marginBottom: 20 }}
            />
            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
            <Pressable
                style={globalStyles.button}
                onPress={handleResetPassword}
                disabled={loading}
            >
                <Text style={{ color: '#fff' }}>
                    {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </Text>
            </Pressable>
        </Screen>
    )
}
