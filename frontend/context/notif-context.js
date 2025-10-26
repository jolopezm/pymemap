import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import notificationsService from '../api/notifications-service'
import { useAuth } from './auth-context'

// safe extraction that handles named/default/CommonJS
const safeGetNotifications =
    notificationsService?.getNotifications ??
    notificationsService?.default?.getNotifications ??
    (typeof notificationsService === 'function' ? notificationsService : undefined)

const NotifContext = createContext({})

export const NotifProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const { user } = useAuth()

    const computeUnread = list => (Array.isArray(list) ? list.filter(n => !n.read).length : 0)

    const fetchNotifications = useCallback(async () => {
        try {
            // Always try to fetch from remote first to avoid stale storage data
            if (safeGetNotifications && user) {
                const fresh = await safeGetNotifications(user?.id || user?._id)
                setNotifications(fresh)
                const computed = computeUnread(fresh)
                setUnreadCount(computed)
                console.debug('NotifProvider.fetchNotifications: fetched remote', {
                    count: Array.isArray(fresh) ? fresh.length : 0,
                    unread: computed,
                })
                await AsyncStorage.setItem('notifications', JSON.stringify(fresh))
                return fresh
            }

            // Fallback to storage only if remote fetch is unavailable
            const stored = await AsyncStorage.getItem('notifications')
            if (stored) {
                const parsed = JSON.parse(stored)
                setNotifications(parsed)
                const computed = computeUnread(parsed)
                setUnreadCount(computed)
                console.debug('NotifProvider.fetchNotifications: loaded from storage (fallback)', {
                    count: parsed.length,
                    unread: computed,
                })
                return parsed
            }

            // fallback: empty list
            setNotifications([])
            setUnreadCount(0)
            return []
        } catch (err) {
            console.error('fetchNotifications error', err)
            setNotifications([])
            setUnreadCount(0)
            return []
        }
    }, [user])

    useEffect(() => {
        // refresh when user changes
        fetchNotifications()
    }, [fetchNotifications])

    const refreshNotifications = async () => {
        // force refetch from remote if possible
        try {
            if (safeGetNotifications && user) {
                const fresh = await safeGetNotifications(user?.id || user?._id)
                setNotifications(fresh)
                const computed = computeUnread(fresh)
                setUnreadCount(computed)
                console.debug('NotifProvider.refreshNotifications: fetched remote', {
                    count: Array.isArray(fresh) ? fresh.length : 0,
                    unread: computed,
                })
                await AsyncStorage.setItem('notifications', JSON.stringify(fresh))
                return fresh
            }
            // otherwise, read from storage
            const stored = await AsyncStorage.getItem('notifications')
            const parsed = stored ? JSON.parse(stored) : []
            setNotifications(parsed)
            setUnreadCount(computeUnread(parsed))
            return parsed
        } catch (err) {
            console.error('refreshNotifications error', err)
            return []
        }
    }

    // Mark a single notification as read in the context state (optimistic/local update)
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
                // persist to storage (fire-and-forget)
                AsyncStorage.setItem('notifications', JSON.stringify(next)).catch(e =>
                    console.warn('AsyncStorage setItem failed in markNotificationReadLocally', e)
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