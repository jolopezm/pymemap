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
        console.log('📝 Creating chat:', chatData)
        const response = await axios.post(`${API_URL}/chat/`, chatData, {
            headers,
        })
        console.log('✅ Chat created:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ Error creating chat:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        })
        throw error
    }
}

export async function getChats(userId) {
    if (!userId) throw new Error('userId is required to get chats')

    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}

    try {
        console.log('📥 Fetching chats for user:', userId)
        const response = await axios.get(
            `${API_URL}/chat/?user_id=${encodeURIComponent(userId)}`,
            { headers }
        )
        console.log(`✅ ${response.data.length} chats fetched`)
        return response.data
    } catch (error) {
        console.error('❌ Error fetching chats:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        })
        throw error
    }
}

export async function getChatByParticipants(user1Id, user2Id) {
    if (!user1Id || !user2Id)
        throw new Error('Both user IDs are required to get chat')

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
            `${API_URL}/chat/participants?user1_id=${encodeURIComponent(user1Id)}&user2_id=${encodeURIComponent(user2Id)}`,
            { headers }
        )
        console.log('✅ Chat encontrado:', response.data)
        return response.data
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('ℹ️ Chat no existe, necesita ser creado')
            return null
        }
        console.error('❌ Error buscando chat:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
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
        console.log('📤 Sending message:', messageData)
        const response = await axios.post(
            `${API_URL}/chat/message`,
            messageData,
            { headers }
        )
        console.log('✅ Message sent:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ Error sending message:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        })
        throw error
    }
}

export async function getMessages(chatId) {
    if (!chatId) throw new Error('chatId is required to get messages')

    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}
    try {
        console.log('📥 Fetching messages for chat:', chatId)
        const response = await axios.get(
            `${API_URL}/chat/messages?chat_id=${encodeURIComponent(chatId)}`,
            { headers }
        )
        console.log(`✅ ${response.data.length} messages fetched`)
        return response.data
    } catch (error) {
        console.error('❌ Error fetching messages:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            chatId: chatId,
        })
        throw error
    }
}

export async function markChatAsRead(chatId, userId) {
    if (!chatId) throw new Error('chatId is required to mark chat as read')
    if (!userId) throw new Error('userId is required to mark chat as read')

    // ✅ Validar que chatId es un string válido
    const cleanChatId = String(chatId).trim()
    const cleanUserId = String(userId).trim()

    if (cleanChatId.length === 0) {
        console.error('❌ chatId está vacío después de limpiar')
        throw new Error('Invalid chatId: empty string')
    }

    if (cleanUserId.length === 0) {
        console.error('❌ userId está vacío después de limpiar')
        throw new Error('Invalid userId: empty string')
    }

    const token = await AsyncStorage.getItem('token')
    const headers = token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}

    try {
        console.log('📖 Marcando chat como leído:', {
            chatId: cleanChatId,
            userId: cleanUserId,
            chatIdType: typeof cleanChatId,
            userIdType: typeof cleanUserId,
            chatIdLength: cleanChatId.length,
            userIdLength: cleanUserId.length,
        })

        const url = `${API_URL}/chat/chat/${encodeURIComponent(cleanChatId)}/mark-as-read?user_id=${encodeURIComponent(cleanUserId)}`
        console.log('🔗 URL completa:', url)

        const response = await axios.put(
            url,
            {},
            {
                headers,
                timeout: 5000,
            }
        )

        console.log('✅ Respuesta del servidor:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ Error marking chat as read:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            chatId: cleanChatId,
            userId: cleanUserId,
        })

        // Si el error es 400, mostrar detalles adicionales
        if (error.response?.status === 400) {
            console.error('🔍 Detalles del error 400:', {
                detail: error.response?.data?.detail,
                chatIdProvided: cleanChatId,
                userIdProvided: cleanUserId,
            })
        }

        // Si el error es 404 o 500, no es crítico
        if (error.response?.status === 404 || error.response?.status === 500) {
            console.log('⚠️ Error no crítico, continuando...')
            return null
        }

        throw error
    }
}
