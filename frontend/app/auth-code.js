import { useEffect, useState } from 'react'
import { verifyAuthCode } from '../api/auth-service'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, Text, TextInput, Button } from 'react-native'
import Screen from '../components/screen'

export default function AuthCodeForm() {
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const router = useRouter()
    const { from } = useLocalSearchParams()
    const [timeLeft, setTimeLeft] = useState(600)

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    useEffect(() => {
        let timerId

        const initializeTimer = async () => {
            let expirationTime = await AsyncStorage.getItem('authCodeExpiresAt')

            if (!expirationTime) {
                expirationTime = Date.now() + 600 * 1000
                await AsyncStorage.setItem(
                    'authCodeExpiresAt',
                    String(expirationTime)
                )
            } else {
                expirationTime = Number(expirationTime)
            }

            const updateTimer = () => {
                const remaining = Math.round(
                    (expirationTime - Date.now()) / 1000
                )
                if (remaining <= 0) {
                    setTimeLeft(0)
                    Toast.error(
                        'El código ha expirado. Por favor, solicita uno nuevo.',
                        { duration: 3000 }
                    )
                    AsyncStorage.removeItem('authCodeExpiresAt')
                    clearInterval(timerId)
                } else {
                    setTimeLeft(remaining)
                }
            }

            updateTimer()
            timerId = setInterval(updateTimer, 1000)
        }

        initializeTimer()

        return () => clearInterval(timerId)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const authData = await AsyncStorage.getItem('authData')
            if (authData) {
                const parsedData = JSON.parse(authData)
                setEmail(parsedData.user?.email || '')
                setCode(parsedData.code || '')
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async e => {
        e.preventDefault()
        try {
            await verifyAuthCode({ email: email, code: code })
            await AsyncStorage.removeItem('authCodeExpiresAt')
            if (from === 'forgot-password') {
                router.push('/reset-password')
                Toast.success(
                    'Correo verificado. Ahora puedes cambiar tu contraseña.',
                    { duration: 3000 }
                )
            } else {
                router.push('/login')
                Toast.success('Correo verificado.', { duration: 3000 })
            }
        } catch (error) {
            console.error('Error al verificar el código:', error)
            Toast.error(
                error.response?.data?.detail || 'Error al verificar el código.'
            )
        }
    }

    return (
        <Screen>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, marginBottom: 20 }}>
                    Verificación de Código
                </Text>
                <TextInput
                    placeholder="Código de Autenticación"
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 10,
                        marginBottom: 20,
                    }}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    maxLength={6}
                />
                <Text>
                    Tiempo restante: {minutes}:
                    {String(seconds).padStart(2, '0')}
                </Text>
                <Button
                    title="Verificar Código"
                    onPress={handleSubmit}
                    disabled={timeLeft === 0}
                />
            </View>
        </Screen>
    )
}
