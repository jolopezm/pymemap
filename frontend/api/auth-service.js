import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = 'http://localhost:8000'

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

export async function getCurrentUser() {
    try {
        const token = await AsyncStorage.getItem('token')
        if (!token) {
            return null
        }

        const response = await axios.get(`${API_URL}/users/me`)

        await AsyncStorage.setItem('user', JSON.stringify(response.data))
        return response.data
    } catch (error) {
        if (error.response?.status === 401) {
            await logout()
        }
        throw error
    }
}

export async function isAuthenticated() {
    const token = await AsyncStorage.getItem('token')
    return !!token
}

export async function getToken() {
    return await AsyncStorage.getItem('token')
}

export async function login({ email, password }) {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)

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

export async function logout() {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
}

export async function sendAuthCode(email) {
    const params = new URLSearchParams()
    params.append('email', email)

    const response = await axios.post(
        `${API_URL}/send-auth-code`,
        params.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    )
    return response.data
}

export async function verifyAuthCode(authData) {
    const params = new URLSearchParams()
    params.append('email', authData.email)
    params.append('code', authData.auth_code)

    const response = await axios.post(
        `${API_URL}/verify-auth-code`,
        params.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    )
    return response.data
}
