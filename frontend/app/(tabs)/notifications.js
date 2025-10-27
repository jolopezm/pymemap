import { Text, View, Pressable } from 'react-native'
import Screen from '../../components/screen'
import { useAuth } from '../../context/auth-context'
import React from 'react'
import { globalStyles, colors} from '../../styles/global'
import * as notificationsService from '../../api/notifications-service'
import DefaultModal from '../../components/default-modal'
import { useNotif } from '../../context/notif-context'
import NotificationFilter from '../../components/notif-filter'
import LoadingSpinner from '../../components/loading-spinner'
import { Ionicons } from '@expo/vector-icons';


const getNotifications =
    notificationsService?.getNotifications ??
    notificationsService?.default ??
    (typeof notificationsService === 'function' ? notificationsService : undefined)

const markNotificationAsRead =
    notificationsService?.markNotificationAsRead ??
    notificationsService?.default?.markNotificationAsRead

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
    const [allNotifications, setAllNotifications] = React.useState([])
    const [notifications, setNotifications] = React.useState([])
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

        if (!notification?.read) {
            const notificationId = notification?._id || notification?.id
            if (!notificationId) return
            try {
                setAllNotifications(prev =>
                    prev.map(n =>
                        n?._id === notificationId || n?.id === notificationId
                            ? { ...n, read: true }
                            : n
                    )
                )
                setNotifications(prev =>
                    prev.map(n =>
                        n?._id === notificationId || n?.id === notificationId
                            ? { ...n, read: true }
                            : n
                    )
                )
                setSelectedNotification(s => (s ? { ...s, read: true } : s))

                await markNotificationAsRead(notificationId)
                try {
                    const updated = await markNotificationReadLocally(notificationId)
                    if (!updated) {
                        console.warn('markNotificationReadLocally returned falsy')
                    }
                } catch (e) {
                    console.warn('markNotificationReadLocally failed', e)
                }

                try {
                    const refreshed = await refreshNotifications()
                    console.debug('notifications: refreshNotifications result', {
                        refreshedCount: Array.isArray(refreshed) ? refreshed.length : null,
                        refreshedUnread: Array.isArray(refreshed) ? refreshed.filter(n => !n.read).length : null,
                    })
                } catch (e) {
                    console.warn('refreshNotifications failed after mark as read', e)
                }
            } catch (err) {
                console.error('Error marking notification as read:', err)
                try {
                    const fresh = await getNotifications(user._id)
                    setAllNotifications(fresh)
                    setNotifications(fresh)
                    const unread = fresh.filter(n => !n.read).length
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
                setAllNotifications(sorted)
                setNotifications(sorted)
                const unread = sorted.filter(n => !n.read).length
            } catch (err) {
                console.error('getNotifications error', err)
                if (err?.response?.data) {
                    console.error('backend response:', err.response.data)
                    setError(err.response.data)
                } else {
                    setError({ message: err.message || 'Unknown error' })
                }
                setAllNotifications([])
                setNotifications([])
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [user])

    const handleFilterChange = newFilter => {
        if (newFilter === 'all') {
            setNotifications(sortNotifications(allNotifications))
        } else if (newFilter === 'unread') {
            const filtered = allNotifications.filter(n => !n.read)
            setNotifications(sortNotifications(filtered))
        } else if (newFilter === 'read') {
            const filtered = allNotifications.filter(n => n.read)
            setNotifications(sortNotifications(filtered))
        }
    }

    return (
        <Screen>
            {user ? (
                <>
                <NotificationFilter
                    notifications={notifications}
                    onFilterChange={handleFilterChange}
                />
                    <View>
                        {notifications.length > 0 ? (
                            <>
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
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    gap: 8,
                                                    alignItems: 'flex-start',
                                                    padding: 12,
                                                },
                                            ]}
                                        >
                                            <Ionicons 
                                                name="information-circle" 
                                                size={32} color={colors.primary} 
                                            />
                                            <View>
                                                <Text 
                                                    style={{ fontWeight: '600', fontSize: 16 }}
                                                    numberOfLines={1} 
                                                    ellipsizeMode="tail"
                                                >
                                                    {notification.message.length > 30
                                                        ? `${notification.message.substring(0, 30)}...`
                                                        : notification.message
                                                    }
                                                </Text>
                                                <Text 
                                                    style={{ fontSize: 12, color: colors.gray }}
                                                >
                                                    {new Date(notification.date).toLocaleString()}
                                                </Text>
                                            </View>
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
                                    {selectedNotification.type == 'service_request' ? 'Solicitud de Servicio' : 'General'}
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

            {loading && (
                <View style={{ marginTop: 16 }}>
                    <LoadingSpinner />
                </View>
            )}

            {error && (
                <Text style={[globalStyles.subtitle, { color: 'red' }]}>
                    Error: {error.message || 'An error occurred'}
                </Text>
            )}
        </Screen>
    )
}