import { useEffect, useState } from 'react'
import { verifyAuthCode } from '../api/auth-service'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Toast } from 'toastify-react-native'

export default function AuthCodeForm() {
    const [code, setCode] = useState('')
    const params = useLocalSearchParams()
    const router = useRouter()

    // 1. La inicialización del estado ahora es una función que lee del localStorage
    const [timeLeft, setTimeLeft] = useState(() => {
        const expirationTime = localStorage.getItem('authCodeExpiresAt')
        if (expirationTime) {
            const remaining = Math.round((expirationTime - Date.now()) / 1000)
            return remaining > 0 ? remaining : 0
        }
        return 600 // Valor inicial solo si no hay nada guardado
    })

    useEffect(() => {
        // 2. Guardar la marca de tiempo de expiración si no existe
        const expirationTime = localStorage.getItem('authCodeExpiresAt')
        if (!expirationTime) {
            localStorage.setItem(
                'authCodeExpiresAt',
                Date.now() + timeLeft * 1000
            )
        }

        if (timeLeft === 0) {
            Toast.error(
                'El código ha expirado. Por favor, solicita uno nuevo.',
                { duration: 3000 }
            )
            localStorage.removeItem('authCodeExpiresAt') // Limpiar al expirar
            return
        }

        const timerId = setInterval(() => {
            // Actualizamos el estado basado en el tiempo real, no solo restando 1
            const newTimeLeft = Math.round(
                (localStorage.getItem('authCodeExpiresAt') - Date.now()) / 1000
            )
            setTimeLeft(newTimeLeft > 0 ? newTimeLeft : 0)
        }, 1000)

        return () => clearInterval(timerId)
    }, [timeLeft])

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    const handleSubmit = e => {
        e.preventDefault()
        verifyAuthCode({ email: params.email, auth_code: code })
            .then(response => {
                console.log('Código verificado:', response)
                localStorage.removeItem('authCodeExpiresAt') // 3. Limpiar al tener éxito
                router.push({
                    pathname: '/login',
                    params: {
                        email: params.email,
                        password: params.password,
                    },
                })
            })
            .catch(error => {
                console.error('Error al verificar el código:', error)
            })
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
                <p>Código: {params.code}</p>
                <p>
                    Tiempo restante: {minutes}:
                    {String(seconds).padStart(2, '0')}
                </p>
            </div>
            <button type="submit">Verificar Código</button>
        </form>
    )
}
