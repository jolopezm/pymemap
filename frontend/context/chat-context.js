import React, { createContext, useState, useEffect, useCallback } from 'react'
import { getChats, getMessages } from '../api/chat-service'
import { getUserById } from '../api/user-service'
import { useAuth } from './auth-context'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
    const { user } = useAuth()
    const [chats, setChats] = useState([])
    const [otherUsers, setOtherUsers] = useState({})
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Función para calcular mensajes no leídos
    const calculateUnreadCount = useCallback((chatData) => {
        const total = chatData.reduce((sum, chat) => {
            return sum + (chat.unreadMessageCount || 0)
        }, 0)
        setUnreadCount(total)
    }, [])

    // Obtener datos de los otros usuarios en los chats
    const fetchOtherUsers = useCallback(async (chatData) => {
        if (!chatData || chatData.length === 0 || !user) return

        const userPromises = chatData.map(async (chat) => {
            try {
                // Determinar quién es el otro usuario (no el usuario autenticado)
                const otherUserId = chat.participants?.find(
                    participantId => participantId !== (user.id || user._id)
                )

                if (otherUserId) {
                    const otherUser = await getUserById(otherUserId)
                    return { chatId: chat.id || chat._id, user: otherUser }
                }
            } catch (error) {
                console.error('Error fetching other user:', error)
                return null
            }
        })

        const results = await Promise.all(userPromises)
        const usersMap = {}
        results.forEach((result) => {
            if (result) {
                usersMap[result.chatId] = result.user
            }
        })
        setOtherUsers(usersMap)
    }, [user])

    // Obtener todos los chats del usuario
    const fetchChats = useCallback(async () => {
        if (!user) {
            setError('Usuario no autenticado')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const chatData = await getChats(user.id || user._id)
            setChats(chatData)
            calculateUnreadCount(chatData)
            await fetchOtherUsers(chatData)
        } catch (error) {
            console.error('Error fetching chats:', error)
            setError('Error al cargar los chats')
        } finally {
            setLoading(false)
        }
    }, [user, calculateUnreadCount, fetchOtherUsers])

    // Marcar un chat como leído
    const markChatAsRead = useCallback((chatId) => {
        setChats((prevChats) => {
            const updatedChats = prevChats.map((chat) => {
                if ((chat.id || chat._id) === chatId) {
                    return {
                        ...chat,
                        hasUnreadMessages: false,
                        unreadMessageCount: 0,
                    }
                }
                return chat
            })
            calculateUnreadCount(updatedChats)
            return updatedChats
        })
        
        // Opcional: refrescar desde el backend para sincronizar
        // Puedes descomentar esto si quieres una sincronización completa
        // fetchChats()
    }, [calculateUnreadCount])

    // Actualizar último mensaje de un chat
    const updateLastMessage = useCallback((chatId, message) => {
        setChats((prevChats) => {
            return prevChats.map((chat) => {
                if ((chat.id || chat._id) === chatId) {
                    return {
                        ...chat,
                        lastMessage: message.content,
                        lastMessageTime: message.timestamp,
                    }
                }
                return chat
            })
        })
    }, [])

    // Incrementar contador de mensajes no leídos
    const incrementUnreadCount = useCallback((chatId) => {
        setChats((prevChats) => {
            const updatedChats = prevChats.map((chat) => {
                if ((chat.id || chat._id) === chatId) {
                    return {
                        ...chat,
                        hasUnreadMessages: true,
                        unreadMessageCount: (chat.unreadMessageCount || 0) + 1,
                    }
                }
                return chat
            })
            calculateUnreadCount(updatedChats)
            return updatedChats
        })
    }, [calculateUnreadCount])

    // Refrescar chats manualmente
    const refreshChats = useCallback(() => {
        fetchChats()
    }, [fetchChats])

    // Cargar chats al montar el componente o cuando cambie el usuario
    useEffect(() => {
        if (user) {
            fetchChats()
        } else {
            setChats([])
            setOtherUsers({})
            setUnreadCount(0)
            setLoading(false)
        }
    }, [user, fetchChats])

    return (
        <ChatContext.Provider
            value={{
                chats,
                otherUsers,
                unreadCount,
                loading,
                error,
                markChatAsRead,
                updateLastMessage,
                incrementUnreadCount,
                refreshChats,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => {
    const context = React.useContext(ChatContext)
    if (!context) {
        throw new Error('useChat debe usarse dentro de un ChatProvider')
    }
    return context
}
