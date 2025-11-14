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

export async function uploadBusinessPicture(businessId, imageUri, filename) {
    try {
        // Obtener headers de autenticación
        const authHeaders = await getAuthHeaders()

        // Crear FormData
        const formData = new FormData()

        console.log('📤 Subiendo imagen de negocio:', {
            url: `${API_URL}/business/upload-pictures/${businessId}`,
            imageUri,
            filename,
        })

        // Leer la imagen como blob
        const response = await fetch(imageUri)
        const blob = await response.blob()

        // Crear un archivo con el blob
        formData.append('file', blob, filename)

        // Hacer la petición
        const uploadResponse = await fetch(
            `${API_URL}/business/upload-pictures/${businessId}`,
            {
                method: 'POST',
                headers: authHeaders,
                body: formData,
            }
        )

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}))
            console.error('❌ Error del servidor:', errorData)
            throw new Error(errorData.detail || `HTTP ${uploadResponse.status}`)
        }

        const data = await uploadResponse.json()
        console.log('✅ Upload exitoso:', data)
        return data
    } catch (error) {
        console.error('❌ Error al subir imagen:', error)
        throw error
    }
}

export async function updateBusiness(businessId, updateData) {
    const headers = await getAuthHeaders()
    const response = await axios.patch(
        `${API_URL}/business/${businessId}`,
        updateData,
        { headers }
    )
    return response.data
}

export async function updateBusinessLocation(businessId, latitude, longitude) {
    const headers = await getAuthHeaders()
    const response = await axios.patch(
        `${API_URL}/business/${businessId}/location`,
        { latitude, longitude },
        { headers }
    )
    return response.data
}

export async function getNearbyBusinesses(latitude, longitude, radiusKm = 10) {
    const headers = await getAuthHeaders()
    const response = await axios.get(`${API_URL}/business/nearby`, {
        params: { latitude, longitude, radius_km: radiusKm },
        headers,
    })
    return response.data
}
