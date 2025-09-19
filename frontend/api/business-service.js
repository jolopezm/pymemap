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

export async function getBusiness() {
    const headers = await getAuthHeaders()
    const response = await axios.get(`${API_URL}/business`, { headers })
    return response.data
}

export async function createBusiness(businessData) {
    const response = await axios.post(`${API_URL}/business`, businessData)
    return response.data
}
