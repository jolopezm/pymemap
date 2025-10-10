import { login } from '../api/auth-service'
import { validateLoginData } from './validate-user-data'
import { User } from '../classes/user'

export const handleLogin = async (email, password) => {
    const validation = validateLoginData(email, password)
    if (!validation.valid) {
        return { success: false, error: validation.error }
    }

    try {
        const user = new User(null, null, email, password)
        const result = await login(user)
        return { success: true, data: result }
    } catch (error) {
        if (error.response?.status === 401) {
            return { success: false, error: 'Credenciales incorrectas' }
        }
        if (error.response?.status === 500) {
            return {
                success: false,
                error: 'Error del servidor. Intenta más tarde.',
            }
        }
        return {
            success: false,
            error: 'Error de conexión. Verifica tu internet.',
        }
    }
}
