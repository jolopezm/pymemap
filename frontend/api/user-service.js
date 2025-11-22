import AsyncStorage from '@react-native-async-storage/async-storage'
import axiosInstance from './axios-instance'
import { API_URL } from '../config/api'
import logger from '../utils/logger'

// Función auxiliar para subidas de archivos (FormData requiere headers personalizados)
async function getAuthHeaders() {
    const token = await AsyncStorage.getItem('token')
    if (token) {
        return {
            Authorization: `Bearer ${token}`,
        }
    }
    return {}
}

export async function getUsers() {
    const response = await axiosInstance.get('/users')
    return response.data
}

export async function createUser(userData) {
    const response = await axiosInstance.post('/users', userData)
    return response.data
}

export async function updateUser(userId, userData) {
    const response = await axiosInstance.put(`/users/${userId}`, userData)
    return response.data
}

export async function changePassword(userId, passwords) {
    const response = await axiosInstance.post(
        `/users/${userId}/change-password`,
        passwords
    )
    return response.data
}

export async function resetPassword(data) {
    const response = await axiosInstance.post('/users/reset-password', data)
    return response.data
}

export async function deleteUser(userId) {
    const response = await axiosInstance.delete(`/users/${userId}`)
    return response.data
}

export const updateBalance = async (userId, amount, isPositive = true) => {
    const response = await fetch(`${API_URL}/users/${userId}/update-balance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, isPositive }),
    })

    if (!response.ok) {
        throw new Error('Error updating balance')
    }

    return await response.json()
}

export const uploadProfilePicture = async (userId, imageUri, filename) => {
    try {
        // Obtener headers de autenticación
        const authHeaders = await getAuthHeaders()

        // Crear FormData
        const formData = new FormData()

        // Para React Native en Web o Expo, necesitamos crear un objeto File-like
        const uriParts = imageUri.split('.')
        const fileType = uriParts[uriParts.length - 1]

        // Intentar con fetch y blob
        const response = await fetch(imageUri)
        const blob = await response.blob()

        // Crear un archivo con el blob
        formData.append('file', blob, filename)

        // Hacer la petición
        const uploadResponse = await fetch(
            `${API_URL}/users/upload-profile-picture/${userId}`,
            {
                method: 'POST',
                headers: authHeaders,
                body: formData,
            }
        )

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}))
            logger.error('Error del servidor al subir imagen:', errorData)
            throw new Error(errorData.detail || `HTTP ${uploadResponse.status}`)
        }

        const data = await uploadResponse.json()
        return data
    } catch (error) {
        logger.error('Error al subir imagen:', error)
        throw error
    }
}

export const getUserById = async userId => {
    const response = await axiosInstance.get(`/users/${userId}`)
    return response.data
}
