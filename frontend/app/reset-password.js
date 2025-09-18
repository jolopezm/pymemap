import { useState, useEffect } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { resetPassword } from '../api/user-service'
import globalStyles from '../styles/global'
import { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function ResetPassword() {
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const router = useRouter()
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
            await AsyncStorage.removeItem('authData')
            Toast.success('Éxito', {
                duration: 3000,
            })
            router.push('/login')
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
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Restablecer Contraseña</Text>
            <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                style={globalStyles.textField}
                placeholder="Nueva contraseña"
                secureTextEntry
            />
            <TextInput
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                style={globalStyles.textField}
                placeholder="Confirmar nueva contraseña"
                secureTextEntry
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
        </View>
    )
}
