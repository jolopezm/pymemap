import { useEffect, useState } from 'react'
import { verifyAuthCode } from '../api/auth-service'
import { useRouter } from 'expo-router'
import { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AuthCodeForm() {
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const router = useRouter()
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
            router.push('/login')
            Toast.success('Correo verificado.', { duration: 3000 })
        } catch (error) {
            console.error('Error al verificar el código:', error)
            Toast.error(
                error.response?.data?.detail || 'Error al verificar el código.'
            )
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Código de Autenticación:</label>
                <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                />
                <p>Código: {code}</p>
                <p>
                    Tiempo restante: {minutes}:
                    {String(seconds).padStart(2, '0')}
                </p>
            </div>
            <button type="submit" disabled={timeLeft === 0}>
                Verificar Código
            </button>
        </form>
    )
}
