import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Toast } from 'toastify-react-native'
import { User } from '../classes/user'
import { sendAuthCode } from '../api/auth-service'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email:</label>
                <input
                    type="text"
                    id="email"
                    value={user.email}
                    onChange={e =>
                        setUser(prev => ({ ...prev, email: e.target.value }))
                    }
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Solicitar Código'}
            </button>
        </form>
    )
}
