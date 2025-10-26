import { Text, View, Pressable } from 'react-native'
import Screen from '../../components/screen'
import { useAuth } from '../../context/auth-context'
import React from 'react'
import globalStyles from '../../styles/global'
import * as notificationsService from '../../api/notifications-service'
import DefaultModal from '../../components/default-modal'
import { useNotif } from '../../context/notif-context'

console.log('notificationsService module:', notificationsService)

// safe extraction that works con exports: named, default, CommonJS, o cuando el módulo es la función misma
const getNotifications =
    notificationsService?.getNotifications ??
    // default export may be the function itself
    notificationsService?.default ??
    (typeof notificationsService === 'function' ? notificationsService : undefined)

const markNotificationAsRead =
    notificationsService?.markNotificationAsRead ??
    // in case the module was imported as a namespace and default is an object with methods
    notificationsService?.default?.markNotificationAsRead

// fallback errors to fail fast with a clear message
if (!getNotifications) {
    console.error('getNotifications no disponible en notifications-service. Revisa sus exports.')
}

if (!markNotificationAsRead) {
    console.error('markNotificationAsRead no disponible en notifications-service. Revisa sus exports y la importación.')
}

const { getNotifications: _unused1, markNotificationAsRead: _unused2 } = {}

export default function NotificationsScreen() {
    const { user } = useAuth()
    const { refreshNotifications, markNotificationReadLocally } = useNotif()
    const [notifications, setNotifications] = React.useState([])
    const [amountUnread, setAmountUnread] = React.useState(0)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [modalVisible, setModalVisible] = React.useState(false)
    const [selectedNotification, setSelectedNotification] = React.useState(null)

    const openNotification = async notification => {
        setSelectedNotification(notification)
        setModalVisible(true)
        console.log(
            'Opening notification',
            notification?._id || notification?.id
        )

        // If the notification is unread, mark it as read on the server and
        // update the local state optimistically so the UI reflects the change
        if (!notification?.read) {
            const notificationId = notification?._id || notification?.id
            if (!notificationId) return
            try {
                // Optimistic update
                setNotifications(prev =>
                    prev.map(n =>
                        n?._id === notificationId || n?.id === notificationId
                            ? { ...n, read: true }
                            : n
                    )
                )
                setAmountUnread(a => Math.max(0, a - 1))
                setSelectedNotification(s => (s ? { ...s, read: true } : s))

                await markNotificationAsRead(notificationId)
                // refresh global notifications state so the unread dot in the tab bar updates
                // Update context locally first so the UI (tab dot) reacts immediately
                try {
                    const updated = await markNotificationReadLocally(notificationId)
                    if (!updated) {
                        console.warn('markNotificationReadLocally returned falsy')
                    }
                } catch (e) {
                    console.warn('markNotificationReadLocally failed', e)
                }

                // Still attempt a refresh to reconcile with server state (non-blocking)
                try {
                    const refreshed = await refreshNotifications()
                    console.debug('notifications: refreshNotifications result', {
                        refreshedCount: Array.isArray(refreshed) ? refreshed.length : null,
                        refreshedUnread: Array.isArray(refreshed) ? refreshed.filter(n => !n.read).length : null,
                    })
                } catch (e) {
                    // non-fatal: log and continue
                    console.warn('refreshNotifications failed after mark as read', e)
                }
            } catch (err) {
                console.error('Error marking notification as read:', err)
                // On error, revert optimistic change (simple approach: refetch)
                try {
                    const fresh = await getNotifications(user._id)
                    setNotifications(fresh)
                    const unread = fresh.filter(n => !n.read).length
                    setAmountUnread(unread)
                } catch (e) {
                    console.error(
                        'Error refetching notifications after mark failure',
                        e
                    )
                }
            }
        }
    }

    const closeModal = () => {
        setModalVisible(false)
        setSelectedNotification(null)
    }

    const sortNotifications = list =>
        [...(list || [])].sort((a, b) => {
            if ((a.read ? 1 : 0) !== (b.read ? 1 : 0)) {
                return a.read ? 1 : -1
            }

            const ta = new Date(a.date).getTime() || 0
            const tb = new Date(b.date).getTime() || 0
            return tb - ta
        })

    React.useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return
            setLoading(true)
            setError(null)
            try {
                const data = await getNotifications(user._id)
                const sorted = sortNotifications(data)
                setNotifications(sorted)
                const unread = sorted.filter(n => !n.read).length
                setAmountUnread(unread)
            } catch (err) {
                console.error('getNotifications error', err)
                if (err?.response?.data) {
                    console.error('backend response:', err.response.data)
                    setError(err.response.data)
                } else {
                    setError({ message: err.message || 'Unknown error' })
                }
                setNotifications([])
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [user])

    return (
        <Screen>
            {user ? (
                <>
                    <View>
                        {notifications.length > 0 ? (
                            <>
                                <Text>{amountUnread} unread notifications</Text>
                                {notifications.map((notification, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() =>
                                            openNotification(notification)
                                        }
                                    >
                                        <View
                                            style={[
                                                globalStyles.card,
                                                {
                                                    opacity: notification.read
                                                        ? 0.5
                                                        : 1,
                                                },
                                            ]}
                                        >
                                            <Text>{notification.type}</Text>
                                            <Text>{notification.date}</Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </>
                        ) : (
                            <Text style={globalStyles.subtitle}>
                                No notifications found.
                            </Text>
                        )}
                    </View>
                    <DefaultModal
                        visible={modalVisible}
                        onRequestClose={closeModal}
                    >
                        {selectedNotification ? (
                            <>
                                <Text
                                    style={{ fontWeight: '700', fontSize: 18 }}
                                >
                                    {selectedNotification.type}
                                </Text>
                                <Text style={{ marginTop: 8 }}>
                                    {selectedNotification.message}
                                </Text>
                                <Pressable
                                    onPress={closeModal}
                                    style={{ marginTop: 16 }}
                                >
                                    <Text style={{ color: '#6A4C93' }}>
                                        Cerrar
                                    </Text>
                                </Pressable>
                            </>
                        ) : null}
                    </DefaultModal>
                </>
            ) : (
                <Text style={globalStyles.subtitle}>
                    Please log in to view notifications.
                </Text>
            )}
        </Screen>
    )
}