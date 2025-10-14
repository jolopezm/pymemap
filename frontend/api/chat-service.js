import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'

export async function createChat(chatData) {
    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}
    try {
        const response = await axios.post(`${API_URL}/chat/`, chatData, {
            headers,
        })
        return response.data
    } catch (error) {
        console.error('Error creating chat:', error)
        throw error
    }
}

export async function getChats(userId) {
    if (!userId) throw new Error('userId is required to fetch chats')

    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}

    try {
        const response = await axios.get(
            `${API_URL}/chat/?user_id=${encodeURIComponent(userId)}`,
            {
                headers,
            }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching chats:', error)
        throw error
    }
}
