import {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import notificationsService from '../api/notifications-service'
import { useAuth } from './auth-context'

const safeGetNotifications =
    notificationsService?.getNotifications ??
    notificationsService?.default?.getNotifications ??
    (typeof notificationsService === 'function'
        ? notificationsService
        : undefined)

const NotifContext = createContext({})

const STORAGE_KEYS = {
    NOTIFICATIONS: '@notifications_data',
    CACHE_TIMESTAMP: '@notifications_cache_timestamp',
}

const CACHE_DURATION = 3 * 60 * 1000 // 3 minutos

export const NotifProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isFromCache, setIsFromCache] = useState(false)
    const { user } = useAuth()

    const computeUnread = list =>
        Array.isArray(list) ? list.filter(n => !n.read).length : 0

    const saveToCache = async notifData => {
        try {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifData)],
                [STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString()],
            ])
            console.log('✅ Notificaciones guardadas en caché')
        } catch (error) {
            console.error('Error guardando notificaciones:', error)
        }
    }

    const loadFromCache = async () => {
        try {
            const [[, notifsJson], [, timestamp]] = await AsyncStorage.multiGet(
                [STORAGE_KEYS.NOTIFICATIONS, STORAGE_KEYS.CACHE_TIMESTAMP]
            )

            if (notifsJson && timestamp) {
                const cacheAge = Date.now() - parseInt(timestamp)
                const isStale = cacheAge > CACHE_DURATION

                return {
                    notifications: JSON.parse(notifsJson),
                    isStale,
                    cacheAge: Math.floor(cacheAge / 1000),
                }
            }

            return null
        } catch (error) {
            console.error('Error cargando notificaciones del caché:', error)
            return null
        }
    }

    const fetchNotifications = useCallback(
        async (forceRefresh = false) => {
            setLoading(true)

            try {
                // 1️⃣ Intentar cargar del caché primero
                if (!forceRefresh) {
                    const cached = await loadFromCache()

                    if (cached && !cached.isStale) {
                        console.log(
                            `📦 Usando notificaciones del caché (${cached.cacheAge}s antiguo)`
                        )
                        setNotifications(cached.notifications)
                        setUnreadCount(computeUnread(cached.notifications))
                        setIsFromCache(true)
                        setLoading(false)

                        // Actualizar en segundo plano
                        if (safeGetNotifications && user) {
                            setTimeout(() => fetchNotifications(true), 100)
                        }
                        return cached.notifications
                    }

                    // Si hay caché obsoleto, úsalo mientras cargas
                    if (cached) {
                        console.log(
                            '⚠️ Usando caché obsoleto de notificaciones...'
                        )
                        setNotifications(cached.notifications)
                        setUnreadCount(computeUnread(cached.notifications))
                        setIsFromCache(true)
                    }
                }

                // 2️⃣ Obtener datos frescos del servidor
                if (safeGetNotifications && user) {
                    console.log(
                        '🌐 Obteniendo notificaciones frescas del servidor'
                    )
                    const fresh = await safeGetNotifications(
                        user?.id || user?._id
                    )
                    setNotifications(fresh)
                    const computed = computeUnread(fresh)
                    setUnreadCount(computed)
                    setIsFromCache(false)

                    await saveToCache(fresh)

                    return fresh
                }

                // Sin servicio disponible, usar caché
                const cached = await loadFromCache()
                if (cached) {
                    setNotifications(cached.notifications)
                    setUnreadCount(computeUnread(cached.notifications))
                    setIsFromCache(true)
                    return cached.notifications
                }

                setNotifications([])
                setUnreadCount(0)
                return []
            } catch (err) {
                console.error('fetchNotifications error', err)

                // 3️⃣ Fallback a caché en caso de error
                const cached = await loadFromCache()
                if (cached) {
                    console.log(
                        '🆘 Error de red, usando caché de notificaciones'
                    )
                    setNotifications(cached.notifications)
                    setUnreadCount(computeUnread(cached.notifications))
                    setIsFromCache(true)
                    return cached.notifications
                }

                setNotifications([])
                setUnreadCount(0)
                return []
            } finally {
                setLoading(false)
            }
        },
        [user]
    )

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    const refreshNotifications = async () => {
        return await fetchNotifications(true)
    }

    const markNotificationReadLocally = async notificationId => {
        try {
            setNotifications(prev => {
                const next = (Array.isArray(prev) ? prev : []).map(n =>
                    n && (n._id === notificationId || n.id === notificationId)
                        ? { ...n, read: true }
                        : n
                )
                const unread = computeUnread(next)
                setUnreadCount(unread)

                // Guardar en caché
                saveToCache(next).catch(e =>
                    console.warn(
                        'Error guardando notificaciones actualizadas',
                        e
                    )
                )

                console.debug('NotifProvider.markNotificationReadLocally', {
                    notificationId,
                    nextCount: next.length,
                    unread,
                })
                return next
            })
            return true
        } catch (err) {
            console.error('markNotificationReadLocally error', err)
            return false
        }
    }

    return (
        <NotifContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                isFromCache,
                refreshNotifications,
                markNotificationReadLocally,
            }}
        >
            {children}
        </NotifContext.Provider>
    )
}

export const useNotif = () => {
    const context = useContext(NotifContext)
    if (!context) {
        throw new Error('useNotif must be used within a NotifProvider')
    }
    return context
}
