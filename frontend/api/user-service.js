import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'

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
    const headers = await getAuthHeaders()
    const response = await axios.get(`${API_URL}/users`, { headers })
    return response.data
}

export async function createUser(userData) {
    const response = await axios.post(`${API_URL}/users`, userData)
    return response.data
}

export async function updateUser(userId, userData) {
    const headers = await getAuthHeaders()
    const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
        headers,
    })
    return response.data
}

export async function changePassword(userId, passwords) {
    const headers = await getAuthHeaders()
    const response = await axios.post(
        `${API_URL}/users/${userId}/change-password`,
        passwords,
        {
            headers,
        }
    )
    return response.data
}

export async function resetPassword(data) {
    const response = await axios.post(`${API_URL}/users/reset-password`, data)
    return response.data
}

export async function deleteUser(userId) {
    const headers = await getAuthHeaders()
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers,
    })
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

export const uploadProfilePicture = async (userId, imageData, filename) => {
    const formData = new FormData()
    
    // Para React Native, usa este formato:
    formData.append('file', {
        uri: imageData,
        name: filename || 'profile.jpg',
        type: 'image/jpeg',
    })

    const headers = await getAuthHeaders()
    
    try {
        const response = await axios.post(
            `${API_URL}/users/upload-profile-picture/${userId}`, 
            formData, 
            {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data',
                },
                // Importante para React Native:
                transformRequest: (data, headers) => {
                    return data
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error uploading profile picture:', error.response?.data || error.message)
        throw error
    }
}
