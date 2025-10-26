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
                    } else if (route.name === 'search') {
                        iconName = focused ? 'search' : 'search-outline'
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
            <Tabs.Screen name="home" options={{ title: '' }} />
            <Tabs.Screen name="search" options={{ title: '' }} />
            <Tabs.Screen name="wallet" options={{ title: '' }} />
            <Tabs.Screen
                name="notifications"
                options={{ title: '' }}
            />
            <Tabs.Screen name="chat" options={{ title: '' }} />
            <Tabs.Screen name="profile" options={{ title: '' }} />
        </Tabs>
    )
}
