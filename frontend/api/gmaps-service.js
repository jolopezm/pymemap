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

export async function fetchAddressSuggestions(input, country = 'us') {
    try {
        const headers = await getAuthHeaders()
        const response = await axios.get(
            `${API_URL}/autocomplete/${encodeURIComponent(input)}`,
            {
                params: { country },
                headers,
            }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching address suggestions:', error)
        throw error
    }
}
