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

// Como el backend NO tiene endpoint /business/:id, siempre buscar en la lista
export async function getBusiness(id) {
    const headers = await getAuthHeaders()
    console.log('[getBusiness] Called with id:', id)

    // Obtener lista completa de negocios
    const response = await axios.get(`${API_URL}/business/`, { headers })
    const list = response.data
    console.log('[getBusiness] Total businesses:', list?.length)

    // Si no se pasó id, devolver toda la lista
    if (!id) {
        return list
    }

    // Si se pasó id, buscar en la lista
    if (Array.isArray(list)) {
        const normalizedId = String(id).trim().toLowerCase()
        console.log('[getBusiness] Searching for normalized id:', normalizedId)

        const found = list.find(b => {
            const mongoId = String(b._id ?? '')
                .trim()
                .toLowerCase()
            const regularId = String(b.id ?? '')
                .trim()
                .toLowerCase()
            const name = String(b.name ?? '')
                .trim()
                .toLowerCase()

            const matches =
                mongoId === normalizedId ||
                regularId === normalizedId ||
                name === normalizedId

            if (matches) {
                console.log('[getBusiness] Found match:', b.name)
            }

            return matches
        })

        if (!found) {
            console.log('[getBusiness] No match found for id:', normalizedId)
        }

        return found || null
    }

    return null
}

// Añadido: incluir headers en la creación (si la API requiere auth)
export async function createBusiness(businessData) {
    const headers = await getAuthHeaders()
    const response = await axios.post(`${API_URL}/business`, businessData, {
        headers,
    })
    return response.data
}
