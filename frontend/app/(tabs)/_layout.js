import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View, StyleSheet } from 'react-native'
import { useNotif } from '../../context/notif-context'

export default function TabLayout() {
    const { unreadCount } = useNotif()
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
                        iconName = focused ? 'receipt' : 'receipt-outline'
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

                    if (route.name === 'notifications') {
                        return (
                            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name={iconName} size={size} color={color} />
                                {unreadCount > 0 ? (
                                    <View style={styles.dot} />
                                ) : null}
                            </View>
                        )
                    }

                    return <Ionicons name={iconName} size={size} color={color} />
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
            <Tabs.Screen name="stores" options={{ title: '' }} />
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

const styles = StyleSheet.create({
    dot: {
        position: 'absolute',
        right: 1,
        top: 1,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ff8c00'
    },
})
