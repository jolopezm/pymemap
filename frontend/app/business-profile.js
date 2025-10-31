import React from 'react'
import { View, Text, Pressable, ScrollView, Button } from 'react-native'
import { useSearchParams } from 'expo-router/build/hooks'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { globalStyles } from '../styles/global'
import { getBusiness, requestService } from '../api/business-service'
import { createNotification } from '../api/notifications-service'
import LoadingSpinner from '../components/loading-spinner'
import { useAuth } from '../context/auth-context'
import { getUserById } from '../api/auth-service'

export default function BusinessProfile() {
    const params = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const [error, setError] = React.useState(null)

    const idRaw =
        params?.get('id') ??
        params?.get('businessId') ??
        params?.get('bizId') ??
        null
    const id = idRaw != null ? decodeURIComponent(String(idRaw)) : null

    const [business, setBusiness] = React.useState(null)
    const [owner, setOwner] = React.useState(null)
    const [loading, setLoading] = React.useState(true)

    const fetchOwner = async ownerId => {
        try {
            const foundOwner = await getUserById(ownerId)
            if (foundOwner) {
                setOwner(foundOwner)
            }
        } catch (error) {
            if (error && error.response) {
                setError({
                    status: error.response.status,
                    data: error.response.data,
                })
            } else {
                setError({ message: String(error) })
            }
        }
    }

    React.useEffect(() => {
        let mounted = true
        const fetch = async () => {
            try {
                setLoading(true)
                const foundBusiness = await getBusiness(id)
                if (!mounted) return

                setBusiness(foundBusiness)
            } catch (error) {
                if (error && error.response) {
                    setError({
                        status: error.response.status,
                        data: error.response.data,
                    })
                } else {
                    setError({ message: String(error) })
                }
                setBusiness(null)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        if (id) {
            fetch()
            if (business && business.owner_id) {
                fetchOwner(business.owner_id)
                console.log('Owner fetched', owner)
            }
        } else {
            setLoading(false)
        }

        return () => {
            mounted = false
        }
    }, [id])

    const handleRequestService = async () => {
        if (!user) {
            alert('You must be logged in to request a service.')
            router.push('/login')
            return
        }

        const serviceData = {
            name: 'Service Request',
            description: 'Requesting a service from ' + (business?.name ?? ''),
            price: 0.0,
            state: 'pending',
            business_id: business?._id,
            client_id: user?._id,
        }

        await requestService(serviceData)
        // Create notification using the fields expected by the backend Notification model
        await createNotification({
            targetUserId: business?.owner_id,
            type: 'service_request',
            message: `Nueva solicitud de servicio de ${user?.name}`,
            date: new Date().toISOString(),
            read: false,
            reference: {
                originUserId: user?._id,
            },
        })
        alert('Service requested successfully!')
    }

    if (loading) {
        return (
            <LinearGradient
                colors={['#9B59B6', '#F8BBD9']}
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={globalStyles.gradientContainer}>
                    <LoadingSpinner />
                </View>
            </LinearGradient>
        )
    }

    if (!business) {
        return (
            <LinearGradient
                colors={['#9B59B6', '#F8BBD9']}
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={globalStyles.gradientContainer}>
                    <Ionicons name="alert-circle" size={64} color="#FFFFFF" />
                    <Text style={[globalStyles.title, { marginTop: 20 }]}>
                        No se encontró el negocio
                    </Text>
                    <Pressable
                        onPress={() => router.push('/profile')}
                        style={{ marginTop: 20 }}
                    >
                        <Text style={globalStyles.linkText}>Volver</Text>
                    </Pressable>
                </View>
            </LinearGradient>
        )
    }

    return (
        <LinearGradient
            colors={['#9B59B6', '#F8BBD9']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <ScrollView
                contentContainerStyle={[
                    globalStyles.gradientContainer,
                    { alignItems: 'stretch' },
                ]}
            >
                <Pressable
                    onPress={() => router.back()}
                    style={globalStyles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    <Text>Volver</Text>
                </Pressable>
                <View style={globalStyles.card}>
                    <Ionicons
                        name="business"
                        size={48}
                        color="#6A4C93"
                        style={{ alignSelf: 'center', marginBottom: 16 }}
                    />

                    <Text style={globalStyles.title}>
                        {business?.name ?? 'Sin nombre'}
                    </Text>

                    <Text style={globalStyles.title}>
                        {owner?.name ?? 'Sin nombre'}
                    </Text>

                    <Text style={[globalStyles.badge, { alignSelf: 'center' }]}>
                        {business?.category ?? 'Sin categoría'}
                    </Text>

                    <Text style={globalStyles.subtitle}>Descripción</Text>
                    <Text style={{ color: '#555', marginBottom: 16 }}>
                        {business?.description ?? 'Sin descripción'}
                    </Text>

                    <Text style={globalStyles.subtitle}>Ubicación</Text>
                    <Text style={{ color: '#555', marginBottom: 16 }}>
                        {business?.address ?? 'Sin ubicación'}
                    </Text>

                    <Button title="Contactar" onPress={handleRequestService} />
                    <Button
                        title="Editar"
                        onPress={() =>
                            router.push(`/edit-business?id=${business._id}`)
                        }
                    />
                </View>
            </ScrollView>
        </LinearGradient>
    )
}
