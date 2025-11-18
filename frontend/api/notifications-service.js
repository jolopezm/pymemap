import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { API_URL } from '../config/api'

export async function createNotification(notificationData) {
    const token = await AsyncStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
        console.log('📤 Creating notification:', {
            url: `${API_URL}/notifications`,
            data: notificationData,
            hasToken: !!token,
        })

        const response = await axios.post(
            `${API_URL}/notifications`,
            notificationData,
            { headers }
        )

        console.log('✅ Notification created successfully:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ Error creating notification:', {
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
        console.warn('⚠️ No userId provided to getNotifications')
        return []
    }

    const token = await AsyncStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
        console.log(`📥 Fetching notifications for user: ${userId}`)
        const response = await axios.get(`${API_URL}/notifications?user_id=${userId}`, {
            headers,
        })
        console.log(`✅ Notifications fetched: ${response.data.length} items`)
        return response.data
    } catch (error) {
        console.error('❌ Error fetching notifications:', error)
        return []
    }
}

export async function markNotificationAsRead(notificationId) {
    if (!notificationId) {
        console.warn('⚠️ No notificationId provided')
        return
    }

    const token = await AsyncStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
        console.log(`📝 Marking notification as read: ${notificationId}`)
        const response = await axios.patch(
            `${API_URL}/notifications/${notificationId}`,
            {},
            { headers }
        )
        console.log('✅ Notification marked as read')
        return response.data
    } catch (error) {
        console.error('❌ Error marking notification as read:', error)
        throw error
    }
}

// Default export for backward compatibility  
export default getNotifications
