import React, {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react'
import { getChats, getMessages } from '../api/chat-service'
import { getUserById } from '../api/user-service'
import { useAuth } from './auth-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import logger from '../utils/logger'

const ChatContext = createContext()

const STORAGE_KEYS = {
    CHATS: '@chats_data',
    OTHER_USERS: '@other_users_data',
    CACHE_TIMESTAMP: '@chats_cache_timestamp',
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const ChatProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth()
    const [chats, setChats] = useState([])
    const [otherUsers, setOtherUsers] = useState({})
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isFromCache, setIsFromCache] = useState(false)

    const saveToCache = async (chatsData, usersData) => {
        try {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.CHATS, JSON.stringify(chatsData)],
                [STORAGE_KEYS.OTHER_USERS, JSON.stringify(usersData)],
                [STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString()],
            ])
        } catch (error) {}
    }

    const loadFromCache = async () => {
        try {
            const [[, chatsJson], [, usersJson], [, timestamp]] =
                await AsyncStorage.multiGet([
                    STORAGE_KEYS.CHATS,
                    STORAGE_KEYS.OTHER_USERS,
                    STORAGE_KEYS.CACHE_TIMESTAMP,
                ])

            if (chatsJson && usersJson && timestamp) {
                const cacheAge = Date.now() - parseInt(timestamp)
                const isStale = cacheAge > CACHE_DURATION

                return {
                    chats: JSON.parse(chatsJson),
                    otherUsers: JSON.parse(usersJson),
                    isStale,
                    cacheAge: Math.floor(cacheAge / 1000),
                }
            }

            return null
        } catch (error) {
            logger.error('Error cargando chats del caché:', error)
            return null
        }
    }

    const clearCache = useCallback(async () => {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.CHATS,
                STORAGE_KEYS.OTHER_USERS,
                STORAGE_KEYS.CACHE_TIMESTAMP,
            ])
        } catch (error) {
            // Error manejado silenciosamente
        }
    }, [])

    // ============= FUNCIONES EXISTENTES =============

    const calculateUnreadCount = useCallback(chatData => {
        const total = chatData.reduce((sum, chat) => {
            return sum + (chat.unreadMessageCount || 0)
        }, 0)
        setUnreadCount(total)
    }, [])

    const fetchOtherUsers = useCallback(
        async chatData => {
            if (!chatData || chatData.length === 0 || !user) return {}

            const userPromises = chatData.map(async chat => {
                try {
                    const otherUserId = chat.participants?.find(
                        participantId => participantId !== (user.id || user._id)
                    )

                    if (otherUserId) {
                        const otherUser = await getUserById(otherUserId)
                        return { chatId: chat.id || chat._id, user: otherUser }
                    }
                } catch (error) {
                    // Silenciosamente manejar 403 (usuario no disponible/sin permisos)
                    if (error.response?.status !== 403) {
                        logger.error('Error fetching other user:', error)
                    }
                    return null
                }
            })

            const results = await Promise.all(userPromises)
            const usersMap = {}
            results.forEach(result => {
                if (result) {
                    usersMap[result.chatId] = result.user
                }
            })
            return usersMap
        },
        [user]
    )

    const fetchChats = useCallback(
        async (forceRefresh = false) => {
            if (!user) {
                setError('Usuario no autenticado')
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            try {
                // 1️⃣ INTENTAR CARGAR DEL CACHÉ PRIMERO
                if (!forceRefresh) {
                    const cached = await loadFromCache()

                    if (cached && !cached.isStale) {
                        setChats(cached.chats)
                        setOtherUsers(cached.otherUsers)
                        calculateUnreadCount(cached.chats)
                        setIsFromCache(true)
                        setLoading(false)

                        // Actualizar en segundo plano
                        setTimeout(() => fetchChats(true), 100)
                        return
                    }

                    // Si hay caché obsoleto, úsalo mientras cargas datos frescos
                    if (cached) {
                        setChats(cached.chats)
                        setOtherUsers(cached.otherUsers)
                        calculateUnreadCount(cached.chats)
                        setIsFromCache(true)
                    }
                }

                // 2️⃣ OBTENER DATOS FRESCOS DEL SERVIDOR
                const chatData = await getChats(user.id || user._id)
                const usersData = await fetchOtherUsers(chatData)

                // 3️⃣ ACTUALIZAR ESTADO Y GUARDAR EN CACHÉ
                setChats(chatData)
                setOtherUsers(usersData)
                calculateUnreadCount(chatData)
                setIsFromCache(false)

                await saveToCache(chatData, usersData)
            } catch (error) {
                logger.error('Error fetching chats:', error)

                // 4️⃣ FALLBACK: Si falla, intentar usar caché aunque esté obsoleto
                const cached = await loadFromCache()
                if (cached) {
                    setChats(cached.chats)
                    setOtherUsers(cached.otherUsers)
                    calculateUnreadCount(cached.chats)
                    setIsFromCache(true)
                    setError('Usando datos guardados (sin conexión)')
                } else {
                    setError('Error al cargar los chats')
                }
            } finally {
                setLoading(false)
            }
        },
        [user, calculateUnreadCount, fetchOtherUsers]
    )

    const markChatAsRead = useCallback(
        async chatId => {
            const updatedChats = chats.map(chat => {
                if ((chat.id || chat._id) === chatId) {
                    return {
                        ...chat,
                        hasUnreadMessages: false,
                        unreadMessageCount: 0,
                    }
                }
                return chat
            })

            setChats(updatedChats)
            calculateUnreadCount(updatedChats)

            // Actualizar caché inmediatamente
            await saveToCache(updatedChats, otherUsers)
        },
        [chats, otherUsers, calculateUnreadCount]
    )

    const updateLastMessage = useCallback(
        async (chatId, message) => {
            const updatedChats = chats.map(chat => {
                if ((chat.id || chat._id) === chatId) {
                    return {
                        ...chat,
                        lastMessage: message.content,
                        lastMessageTime: message.timestamp,
                    }
                }
                return chat
            })

            setChats(updatedChats)

            // Actualizar caché
            await saveToCache(updatedChats, otherUsers)
        },
        [chats, otherUsers]
    )

    const incrementUnreadCount = useCallback(
        async chatId => {
            const updatedChats = chats.map(chat => {
                if ((chat.id || chat._id) === chatId) {
                    return {
                        ...chat,
                        hasUnreadMessages: true,
                        unreadMessageCount: (chat.unreadMessageCount || 0) + 1,
                    }
                }
                return chat
            })

            setChats(updatedChats)
            calculateUnreadCount(updatedChats)

            // Actualizar caché
            await saveToCache(updatedChats, otherUsers)
        },
        [chats, otherUsers, calculateUnreadCount]
    )

    const refreshChats = useCallback(() => {
        fetchChats(true)
    }, [fetchChats])

    useEffect(() => {
        if (authLoading) return // Wait for auth to initialize

        if (user) {
            fetchChats()
        } else {
            setChats([])
            setOtherUsers({})
            setUnreadCount(0)
            setLoading(false)
            clearCache() // Limpiar caché al cerrar sesión
        }
    }, [user, authLoading, fetchChats, clearCache])

    const value = useMemo(
        () => ({
            chats,
            otherUsers,
            unreadCount,
            loading,
            error,
            isFromCache,
            markChatAsRead,
            updateLastMessage,
            incrementUnreadCount,
            refreshChats,
            clearCache,
        }),
        [
            chats,
            otherUsers,
            unreadCount,
            loading,
            error,
            isFromCache,
            markChatAsRead,
            updateLastMessage,
            incrementUnreadCount,
            refreshChats,
            clearCache,
        ]
    )

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
    const context = React.useContext(ChatContext)
    if (!context) {
        throw new Error('useChat debe usarse dentro de un ChatProvider')
    }
    return context
}
