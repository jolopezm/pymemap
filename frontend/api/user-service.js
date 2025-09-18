import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = 'http://localhost:8000'

// Función para obtener headers con autenticación
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

export async function deleteUser(userId) {
    const headers = await getAuthHeaders()
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers,
    })
    return response.data
}
