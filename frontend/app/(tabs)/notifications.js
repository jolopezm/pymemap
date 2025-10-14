import { Text, View } from 'react-native'
import Screen from '../../components/screen'
import { useAuth } from '../../context/auth-context'
import React from 'react'
import globalStyles from '../../styles/global'
import { getNotifications } from '../../api/notifications-service'

export default function NotificationsScreen() {
    const { user } = useAuth()
    const [notifications, setNotifications] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return
            setLoading(true)
            setError(null)
            try {
                const data = await getNotifications(user._id)
                setNotifications(data)
            } catch (err) {
                console.error('getNotifications error', err)
                // Mostrar detalle que devuelve el backend (Pydantic suele devolver detalle de validación)
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
                <View>
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <View key={index} style={globalStyles.card}>
                                <Text>{notification.type}</Text>
                                <Text>{notification.date}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={globalStyles.subtitle}>
                            No notifications found.
                        </Text>
                    )}
                </View>
            ) : (
                <Text style={globalStyles.subtitle}>
                    Please log in to view notifications.
                </Text>
            )}
        </Screen>
    )
}
