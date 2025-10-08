import React from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View, Text, Pressable } from 'react-native'
import globalStyles from '../styles/global'

export default function Item({ business }) {
    const router = useRouter()

    const openBusiness = () => {
        // Usar _id, id o name como fallback para el parámetro id
        const idValue = business._id ?? business.id ?? business.name ?? ''
        console.log('[Item] Navigating with id:', idValue)
        // Usar sintaxis de objeto para params en expo-router
        router.push({
            pathname: '/business-profile',
            params: { id: String(idValue) },
        })
    }

    return (
        <Pressable onPress={openBusiness}>
            <View style={globalStyles.card}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {business.name}
                    </Text>
                    <Text
                        style={{
                            ...globalStyles.badge,
                            marginLeft: 'auto',
                            textAlign: 'right',
                        }}
                    >
                        {business.category}
                    </Text>
                </View>
                <Text style={{ color: '#555' }}>{business.address}</Text>
                <Text numberOfLines={1} ellipsizeMode="tail">
                    {business.description}
                </Text>
            </View>
        </Pressable>
    )
}
