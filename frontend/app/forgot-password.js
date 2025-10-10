import { useState } from 'react'
import { useRouter } from 'expo-router'
import { View, Text, TextInput } from 'react-native'
import { Toast } from 'toastify-react-native'
import { User } from '../classes/user'
import { sendAuthCode } from '../api/auth-service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import globalStyles from '../styles/global'
import Button from '../components/button'
import DismissKeyboard from '../components/dismiss-keyboard'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

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
        <DismissKeyboard>
            <LinearGradient
                colors={['#9B59B6', '#F8BBD9']}
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={globalStyles.gradientContainer}>
                    {/* Icono de contraseña olvidada */}
                    <View style={globalStyles.logoContainer}>
                        <Ionicons name="lock-closed" size={64} color="#FFFFFF" />
                    </View>

                    <Text style={globalStyles.title}>
                        Recuperar Contraseña
                    </Text>

                    <Text style={[globalStyles.subtitle, { marginBottom: 30 }]}>
                        Ingresa tu email para recibir un código de verificación
                    </Text>

                    <TextInput
                        placeholder="Correo electrónico"
                        placeholderTextColor="#999"
                        style={globalStyles.textField}
                        value={user.email}
                        onChangeText={email =>
                            setUser(prev => ({ ...prev, email }))
                        }
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Button
                        title={loading ? 'Enviando...' : 'Solicitar Código'}
                        variant="primary"
                        onPress={handleSubmit}
                        loading={loading}
                        style={{ marginTop: 10 }}
                    />
                </View>
            </LinearGradient>
        </DismissKeyboard>
    )
}
