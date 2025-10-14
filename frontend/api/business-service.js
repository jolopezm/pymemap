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

    // Obtener lista completa de negocios
    const response = await axios.get(`${API_URL}/business/`, { headers })
    const list = response.data

    // Si no se pasó id, devolver toda la lista
    if (!id) {
        return list
    }

    // Si se pasó id, buscar en la lista
    if (Array.isArray(list)) {
        const normalizedId = String(id).trim().toLowerCase()

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
            return matches
        })

        return found || null
    }

    return null
}

export async function createBusiness(businessData) {
    const headers = await getAuthHeaders()
    const response = await axios.post(`${API_URL}/business`, businessData, {
        headers,
    })
    return response.data
}

export async function requestService(serviceData) {
    const headers = await getAuthHeaders()
    const response = await axios.post(
        `${API_URL}/business/request-service`,
        serviceData,
        {
            headers,
        }
    )
    return response.data
}

export async function getServices() {
    const headers = await getAuthHeaders()
    const response = await axios.get(`${API_URL}/business/services`, {
        headers,
    })
    return response.data
}

export async function deleteService(serviceId) {
    const headers = await getAuthHeaders()
    const response = await axios.delete(
        `${API_URL}/business/services/${serviceId}`,
        { headers }
    )
    return response.data
}

export async function updateServiceStatus(serviceId, newStatus) {
    const headers = await getAuthHeaders()
    const response = await axios.patch(
        `${API_URL}/business/services/${serviceId}/status`,
        { state: newStatus },
        { headers }
    )
    return response.data
}

export async function requestPayment(serviceId, requestedPrice) {
    const headers = await getAuthHeaders()
    const response = await axios.patch(
        `${API_URL}/business/services/${serviceId}/request-payment`,
        { requested_price: requestedPrice },
        { headers }
    )
    return response.data
}

export async function payService(serviceId) {
    const headers = await getAuthHeaders()
    const response = await axios.post(
        `${API_URL}/business/services/${serviceId}/pay`,
        {},
        { headers }
    )
    return response.data
}
