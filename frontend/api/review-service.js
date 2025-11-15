import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'

async function getAuthHeaders() {
    const token = await AsyncStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function createReview(reviewData) {
    const headers = await getAuthHeaders()
    const response = await axios.post(`${API_URL}/reviews/`, reviewData, {
        headers,
    })
    return response.data
}

export async function getReviewsByBusiness(businessId) {
    const headers = await getAuthHeaders()
    const response = await axios.get(
        `${API_URL}/reviews/business/${encodeURIComponent(businessId)}`,
        { headers }
    )
    return response.data
}
