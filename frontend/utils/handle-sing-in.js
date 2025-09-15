import { createUser } from '../api/user-service'
import { sendAuthCode } from '../api/auth-service'
import { User } from '../classes/user'
import { validateSignUpData } from './validate-user-data'

export async function handleSignIn({
    rut,
    name,
    email,
    password,
    confirmPassword,
    birthdate,
}) {
    const validation = validateSignUpData({
        rut,
        name,
        email,
        password,
        confirmPassword,
        birthdate,
    })

    if (!validation.valid) {
        return { success: false, error: validation.error }
    }

    try {
        const newUser = new User(rut, name, email, password, birthdate)
        console.log('Enviando usuario al backend:', newUser)

        const result = await createUser(newUser)
        await sendAuthCode(email)
        return { success: true, user: newUser, data: result }
    } catch (error) {
        if (error.response?.status === 400) {
            return {
                success: false,
                error: error.response.data.detail || 'Datos inválidos',
            }
        }
        if (error.response?.status === 409) {
            return { success: false, error: 'El email ya está registrado' }
        }

        return { success: false, error: 'Error al crear usuario' }
    }
}
