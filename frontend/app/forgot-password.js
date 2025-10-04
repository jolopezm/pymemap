import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Toast } from 'toastify-react-native'
import { User } from '../classes/user'
import { sendAuthCode } from '../api/auth-service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Screen from '../components/screen'
import { View, Text, TextInput, Button } from 'react-native'

export default function ForgotPassword() {
    const [user, setUser] = useState(new User())
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await sendAuthCode(user.email)
            const authData = { user: user, code: result.code }
            await AsyncStorage.setItem('authData', JSON.stringify(authData))
            Toast.info(
                'Se ha enviado un correo para restablecer la contraseña.'
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
            Toast.error('Error al enviar el correo de restablecimiento.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Screen>
            <View>
                <Text style={{ fontSize: 24, marginBottom: 20 }}>
                    Restablecer Contraseña
                </Text>
                <TextInput
                    placeholder="Email"
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 10,
                        marginBottom: 20,
                    }}
                    value={user.email}
                    onChangeText={email =>
                        setUser(prev => ({ ...prev, email }))
                    }
                />
                <Button
                    title={loading ? 'Enviando...' : 'Solicitar Código'}
                    onPress={handleSubmit}
                    disabled={loading}
                />
            </View>
        </Screen>
    )
}
