import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { API_URL } from '../config/api'
import logger from '../utils/logger'

export async function createNotification(notificationData) {
    const token = await AsyncStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
        const response = await axios.post(
            `${API_URL}/notifications`,
            notificationData,
            { headers }
        )

        return response.data
    } catch (error) {
        logger.error('❌ Error creating notification:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: `${API_URL}/notifications`,
        })
        throw error
    }
}

export async function getNotifications(userId) {
    if (!userId) {
        logger.warn('⚠️ No userId provided to getNotifications')
        return []
    }

    const token = await AsyncStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
        const response = await axios.get(
            `${API_URL}/notifications?user_id=${userId}`,
            {
                headers,
            }
        )
        return response.data
    } catch (error) {
        logger.error('❌ Error fetching notifications:', error)
        return []
    }
}

export async function markNotificationAsRead(notificationId) {
    if (!notificationId) {
        logger.warn('⚠️ No notificationId provided')
        return
    }

    const token = await AsyncStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
        const response = await axios.patch(
            `${API_URL}/notifications/${notificationId}`,
            {},
            { headers }
        )
        return response.data
    } catch (error) {
        logger.error('❌ Error marking notification as read:', error)
        throw error
    }
}

// Default export for backward compatibility
export default getNotifications
