import { View, StyleSheet, Image, Pressable } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/auth-context'
import { useNotif } from '../../context/notif-context'
import { useChat } from '../../context/chat-context'
import { checkProfilePicUrl } from '../../utils/check-profile-pic'

const ICON_SIZE = 26
const COLORS = {
    primary: '#9B59B6',
    inactive: '#666',
    white: '#FFFFFF',
    border: '#E0E0E0',
    dot: '#ff8c00',
}

export default function TabLayout() {
    const { user } = useAuth()
    const { unreadCount } = useNotif()
    const { unreadCount: chatUnreadCount } = useChat()

    const getIconName = (routeName, focused) => {
        const icons = {
            home: focused ? 'grid' : 'grid-outline',
            stores: focused ? 'storefront' : 'storefront-outline',
            'my-bookings': focused ? 'receipt' : 'receipt-outline',
            notifications: focused ? 'notifications' : 'notifications-outline',
            chat: focused ? 'chatbubbles' : 'chatbubbles-outline',
            profile: focused ? 'person' : 'person-outline',
        }
        return icons[routeName]
    }

    const renderIcon = (route, focused, color) => {
        const iconName = getIconName(route.name, focused)

        if (route.name === 'profile' && user && checkProfilePicUrl(user)) {
            return (
                <Image
                    source={{ uri: user.profile_pic }}
                    style={[
                        styles.profileImage,
                        focused && styles.profileImageFocused,
                    ]}
                />
            )
        }

        if (route.name === 'notifications') {
            return (
                <View style={styles.iconContainer}>
                    <Ionicons name={iconName} size={ICON_SIZE} color={color} />
                    {unreadCount > 0 && <View style={styles.dot} />}
                </View>
            )
        }

        if (route.name === 'chat') {
            return (
                <View style={styles.iconContainer}>
                    <Ionicons name={iconName} size={ICON_SIZE} color={color} />
                    {chatUnreadCount > 0 && <View style={styles.dot} />}
                </View>
            )
        }

        return <Ionicons name={iconName} size={ICON_SIZE} color={color} />
    }

    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color }) => renderIcon(route, focused, color),
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.inactive,
                tabBarShowLabel: true,
                tabBarButton: (props) => (
                    <Pressable
                        {...props}
                        android_ripple={{
                            color: COLORS.primary,
                            borderless: false,
                            radius: 40,
                        }}
                        style={({ pressed }) => [
                            props.style,
                            pressed && styles.tabButtonPressed,
                        ]}
                    />
                ),
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
                headerShown: false,
            })}
        >
            <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
            <Tabs.Screen name="stores" options={{ title: 'Negocios' }} />
            <Tabs.Screen name="my-bookings" options={{ title: 'Reservas' }} />
            <Tabs.Screen name="notifications" options={{ title: 'Alertas' }} />
            <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
            <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
        </Tabs>
    )
}

const styles = StyleSheet.create({
    iconContainer: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: ICON_SIZE / 2,
    },
    profileImageFocused: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    dot: {
        position: 'absolute',
        right: 1,
        top: 1,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.dot,
    },
    tabButtonPressed: {
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        transform: [{ scale: 0.95 }],
    },
    tabBar: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        height: 85,
        paddingBottom: 12,
        paddingTop: 8,
        backgroundColor: COLORS.white,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
})
