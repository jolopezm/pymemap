import { Text, View, Pressable } from 'react-native'
import Screen from '../../components/screen'
import { useAuth } from '../../context/auth-context'
import React from 'react'
import globalStyles from '../../styles/global'
import {
    getNotifications,
    markNotificationAsRead,
} from '../../api/notifications-service'
import DefaultModal from '../../components/default-modal'

export default function NotificationsScreen() {
    const { user } = useAuth()
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

    React.useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return
            setLoading(true)
            setError(null)
            try {
                const data = await getNotifications(user._id)
                setNotifications(data)
                const unread = data.filter(n => !n.read).length
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
