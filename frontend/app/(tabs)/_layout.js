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
                    } else if (route.name === 'lists') {
                        iconName = focused ? 'search' : 'search-outline'
                    } else if (route.name === 'input') {
                        iconName = focused ? 'wallet' : 'wallet-outline'
                    } else if (route.name === 'fonts') {
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
                    height: 70,
                    paddingBottom: 10,
                },
                headerShown: false,
            })}
        >
            <Tabs.Screen name="home" options={{ title: 'Home' }} />
            <Tabs.Screen name="lists" options={{ title: 'Search' }} />
            <Tabs.Screen name="input" options={{ title: 'Input' }} />
            <Tabs.Screen name="fonts" options={{ title: 'My profile' }} />
        </Tabs>
    )
}
