import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'
import {
    getCachedOrFetch,
    setCache,
    invalidateCache,
    TTL,
} from '../utils/cache'

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
    const cacheKey = id ? `business_${id}` : 'business_list'

    try {
        // Intentar obtener del caché (5 minutos)
        const data = await getCachedOrFetch(
            cacheKey,
            async () => {
                const headers = await getAuthHeaders()
                const response = await axios.get(`${API_URL}/business/`, {
                    headers,
                })
                return response.data
            },
            TTL.MEDIUM
        )

        // Si no se pasó id, devolver toda la lista
        if (!id) {
            return data
        }

        // Si se pasó id, buscar en la lista
        if (Array.isArray(data)) {
            const normalizedId = String(id).trim().toLowerCase()

            const found = data.find(b => {
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
    } catch (error) {
        console.error('❌ Error obteniendo negocios:', error.message)
        throw error
    }
}

export async function createBusiness(businessData) {
    try {
        const headers = await getAuthHeaders()
        const response = await axios.post(`${API_URL}/business`, businessData, {
            headers,
        })

        // Invalidar caché al crear negocio
        await invalidateCache('business_list')
        console.log('🗑️ Caché de negocios invalidado después de crear')

        return response.data
    } catch (error) {
        console.error('❌ Error creando negocio:', error.message)
        throw error
    }
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

        // Invalidar caché al subir imagen
        await invalidateCache('business_list')
        await invalidateCache(`business_${businessId}`)
        console.log('🗑️ Caché de negocios invalidado después de subir imagen')

        return data
    } catch (error) {
        console.error('❌ Error al subir imagen:', error)
        throw error
    }
}

export async function updateBusiness(businessId, updateData) {
    try {
        const headers = await getAuthHeaders()
        const response = await axios.patch(
            `${API_URL}/business/${businessId}`,
            updateData,
            { headers }
        )

        // Invalidar caché al actualizar negocio
        await invalidateCache('business_list')
        await invalidateCache(`business_${businessId}`)
        console.log('🗑️ Caché de negocios invalidado después de actualizar')

        return response.data
    } catch (error) {
        console.error('❌ Error actualizando negocio:', error.message)
        throw error
    }
}

export async function updateBusinessLocation(businessId, latitude, longitude) {
    try {
        const headers = await getAuthHeaders()
        const response = await axios.patch(
            `${API_URL}/business/${businessId}/location`,
            { latitude, longitude },
            { headers }
        )

        // Invalidar caché al actualizar ubicación
        await invalidateCache('business_list')
        await invalidateCache(`business_${businessId}`)
        console.log(
            '🗑️ Caché de negocios invalidado después de actualizar ubicación'
        )

        return response.data
    } catch (error) {
        console.error('❌ Error actualizando ubicación:', error.message)
        throw error
    }
}

export async function getNearbyBusinesses(latitude, longitude, radiusKm = 10) {
    const headers = await getAuthHeaders()
    const response = await axios.get(`${API_URL}/business/nearby`, {
        params: { latitude, longitude, radius_km: radiusKm },
        headers,
    })
    return response.data
}
