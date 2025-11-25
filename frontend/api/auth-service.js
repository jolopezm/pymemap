import AsyncStorage from '@react-native-async-storage/async-storage'
import axiosInstance from './axios-instance'
import { API_URL } from '../config/api'
import logger from '../utils/logger'

export async function getCurrentUser() {
    try {
        const token = await AsyncStorage.getItem('token')
        if (!token) {
            return null
        }

        const response = await axiosInstance.get('/users/me')

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
    const response = await axiosInstance.post('/login', { email, password })

    if (response.data.access_token) {
        await AsyncStorage.setItem('token', response.data.access_token)
    }

    return response.data
}

export async function logout() {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('authData')
}

export async function sendAuthCode(email) {
    const response = await axiosInstance.post('/send-auth-code', { email })
    return response.data
}

export async function verifyAuthCode(authData) {
    const response = await axiosInstance.post('/verify-auth-code', authData)
    return response.data
}
