import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = 'http://localhost:8000'

// Se incluye el token de autenticación en cada solicitud
axios.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// Funcion para obtener el usuario actual
export async function getCurrentUser() {
    try {
        const token = await AsyncStorage.getItem('token')
        if (!token) {
            return null
        }

        const response = await axios.get(`${API_URL}/users/me`)

        // Guardar la informacion del usuario en AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(response.data))
        return response.data
    } catch (error) {
        // Si el token es invalido, limpiar el storage
        if (error.response?.status === 401) {
            await logout()
        }
        throw error
    }
}

// Funcion para verificar si el usuario esta autenticado
export async function isAuthenticated() {
    const token = await AsyncStorage.getItem('token')
    return !!token
}

// Funcion para obtener el token de autenticacion
export async function getToken() {
    return await AsyncStorage.getItem('token')
}

// Funcion para iniciar sesion
export async function login(userData) {
    const params = new URLSearchParams()
    params.append('username', userData.email)
    params.append('password', userData.password)

    const response = await axios.post(`${API_URL}/login`, params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })

    if (response.data.access_token) {
        await AsyncStorage.setItem('token', response.data.access_token)
    }
    return response.data
}

// Funcion para cerrar sesion
export async function logout() {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
}

export async function sendAuthCode(email) {
    const response = await axios.post(`${API_URL}/send-auth-code`, { email })
    return response.data
}
