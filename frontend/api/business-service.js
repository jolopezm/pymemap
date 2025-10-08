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

// Cambiado: si se pasa id, intentar /business/:id; si 404, pedir lista y buscar allí.
// Al buscar en la lista comparar _id, id o name.
export async function getBusiness(id) {
    const headers = await getAuthHeaders()
    if (id) {
        try {
            const response = await axios.get(
                `${API_URL}/business/${encodeURIComponent(String(id))}`,
                { headers }
            )
            return response.data // objeto de negocio esperado
        } catch (err) {
            if (err.response && err.response.status === 404) {
                const listResp = await axios.get(`${API_URL}/business/`, {
                    headers,
                })
                const list = listResp.data
                if (Array.isArray(list)) {
                    const normalizedId = String(id).trim().toLowerCase()
                    const found =
                        list.find(b => {
                            const candidate = String(
                                b._id ?? b.id ?? b.name ?? ''
                            )
                            // Normalizar para una comparación robusta
                            return (
                                candidate.trim().toLowerCase() === normalizedId
                            )
                        }) || null
                    return found
                }
                return null
            }
            throw err
        }
    }
    const response = await axios.get(`${API_URL}/business/`, { headers })
    return response.data
}

// Añadido: incluir headers en la creación (si la API requiere auth)
export async function createBusiness(businessData) {
    const headers = await getAuthHeaders()
    const response = await axios.post(`${API_URL}/business`, businessData, {
        headers,
    })
    return response.data
}
