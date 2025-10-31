import React from 'react'
import { useRouter } from 'expo-router'
import Screen from '../components/screen'
import Item from '../plantillas/business-item'
import { View, Text, Pressable } from 'react-native'
import { globalStyles } from '../styles/global'
import { useAuth } from '../context/auth-context'
import { getBusiness } from '../api/business-service'

export default function BusinessesList() {
    const { user } = useAuth()
    const router = useRouter()
    const [businesses, setBusinesses] = React.useState([])

    React.useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const data = await getBusiness()
                setBusinesses(data || [])
            } catch (error) {
                console.error('Error fetching businesses:', error)
            }
        }

        fetchBusinesses()
    }, [])

    return (
        <Screen>
            <Text style={globalStyles.title}>Mis negocios:</Text>
            <Pressable
                style={[globalStyles.button]}
                onPress={() => router.push('/new-business')}
            >
                <Text style={{ color: '#fff' }}>Registrar nuevo negocio</Text>
            </Pressable>
            {businesses.filter(
                business => String(business.owner_id) === String(user._id)
            ).length > 0 ? (
                <View style={{ width: '100%' }}>
                    {businesses
                        .filter(
                            business =>
                                String(business.owner_id) === String(user._id)
                        )
                        .map(item => (
                            <Item
                                key={item._id ?? item.id ?? item.name}
                                business={item}
                            />
                        ))}
                </View>
            ) : (
                <Text>No tienes negocios registrados.</Text>
            )}
        </Screen>
    )
}
