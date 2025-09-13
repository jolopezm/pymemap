import { login } from '../api/auth-service'
import { Toast } from 'toastify-react-native'

export const handleAutoLogin = async (
    params,
    setLoading,
    setError,
    authLogin,
    router
) => {
    const { email, password } = params
    if (email && password) {
        setLoading(true)
        setError('')
        try {
            // Llamamos al servicio de login directamente
            const result = await login({ email, password })
            if (result.access_token) {
                // Usamos el authLogin del contexto para establecer el estado del usuario globalmente
                await authLogin({ email, password }) // Pasar un solo objeto
                // Navegamos a home si tiene éxito
                router.push('/home')
            } else {
                setError('El auto-login falló. Credenciales no válidas.')
                Toast.error('Credenciales inválidas.', { duration: 3000 })
            }
        } catch (e) {
            console.error('Error de auto-login:', e)
            if (e.response) {
                console.error('Datos de respuesta de error:', e.response.data)
                console.error(
                    'Estado de respuesta de error:',
                    e.response.status
                )
            }
            setError(
                'El auto-login falló. Por favor, inicia sesión manualmente.'
            )
            Toast.error('Credenciales inválidas o error de servidor.', {
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }
}
