import { API_URL } from './config.js'

async function getAuthHeaders() {
    const token = localStorage.getItem('token')
    const headers = {
        'Content-Type': 'application/json',
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    return headers
}

export async function getUsers() {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}/users/`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error('Error al obtener usuarios')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en getUsers:', error)
        throw error
    }
}
