import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'

export async function createNotification(notificationData) {
    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}

    try {
        const response = await axios.post(
            `${API_URL}/notifications/`,
            notificationData,
            { headers }
        )
        return response.data
    } catch (error) {
        console.error('Error creating notification:', error)
        throw error
    }
}
export async function getNotifications(userId) {
    if (!userId) throw new Error('userId is required to fetch notifications')

    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}

    try {
        const url = `${API_URL}/notifications/?user_id=${encodeURIComponent(
            userId
        )}`
        const response = await axios.get(url, {
            headers,
        })
        return response.data
    } catch (error) {
        console.error('Error fetching notifications:', error)
        throw error
    }
}
