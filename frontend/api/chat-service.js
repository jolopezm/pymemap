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

export async function getChatByParticipants(user1Id, user2Id) {
    if (!user1Id || !user2Id)
        throw new Error('Both user1Id and user2Id are required to fetch chat')

    console.log('🔍 Buscando chat entre:', {
        user1Id,
        user2Id,
        user1Type: typeof user1Id,
        user2Type: typeof user2Id,
    })

    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}

    try {
        const response = await axios.get(
            `${API_URL}/chat/participants?user1_id=${encodeURIComponent(
                user1Id
            )}&user2_id=${encodeURIComponent(user2Id)}`,
            { headers }
        )
        console.log('✅ Chat encontrado:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ Error fetching chat by participants:', {
            status: error.response?.status,
            detail: error.response?.data?.detail,
            user1Id,
            user2Id,
        })
        throw error
    }
}

export async function sendMessage(messageData) {
    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}

    try {
        const response = await axios.post(
            `${API_URL}/chat/message`,
            messageData,
            { headers }
        )
        return response.data
    } catch (error) {
        console.error('Error sending message:', error)
        throw error
    }
}

export async function getMessages(chatId) {
    if (!chatId) throw new Error('chatId is required to fetch messages')

    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}
    try {
        const response = await axios.get(
            `${API_URL}/chat/messages?chat_id=${encodeURIComponent(chatId)}`,
            { headers }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching messages:', error)
        throw error
    }
}
