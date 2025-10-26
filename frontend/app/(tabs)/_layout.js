import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName

                    if (route.name === 'home') {
                        iconName = focused ? 'home' : 'home-outline'
                    } else if (route.name === 'stores') {
                        iconName = focused ? 'storefront' : 'storefront-outline'
                    } else if (route.name === 'wallet') {
                        iconName = focused ? 'wallet' : 'wallet-outline'
                    } else if (route.name === 'notifications') {
                        iconName = focused
                            ? 'notifications'
                            : 'notifications-outline'
                    } else if (route.name === 'chat') {
                        iconName = focused
                            ? 'chatbubbles'
                            : 'chatbubbles-outline'
                    } else if (route.name === 'profile') {
                        iconName = focused ? 'person' : 'person-outline'
                    }

                    return (
                        <Ionicons name={iconName} size={size} color={color} />
                    )
                },
                tabBarActiveTintColor: '#ff4dc4',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 50,
                    paddingBottom: 0,
                    paddingTop: 8,
                },
                headerShown: false,
                tabBarLabelStyle: { fontSize: 12 },
            })}
        >
            <Tabs.Screen name="home" options={{ title: 'Home' }} />
            <Tabs.Screen name="stores" options={{ title: 'Tiendas' }} />
            <Tabs.Screen name="wallet" options={{ title: 'Billetera' }} />
            <Tabs.Screen
                name="notifications"
                options={{ title: 'Notificaciones' }}
            />
            <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
            <Tabs.Screen name="profile" options={{ title: 'Mi perfil' }} />
        </Tabs>
    )
}
