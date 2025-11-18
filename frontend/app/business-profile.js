import React from 'react'
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Button,
    TextInput,
    Alert,
} from 'react-native'
import { useSearchParams } from 'expo-router/build/hooks'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { globalStyles, colors } from '../styles/global'
import { getBusiness, requestService } from '../api/business-service'
import { createNotification } from '../api/notifications-service'
import LoadingSpinner from '../components/loading-spinner'
import Screen from '../components/screen'
import DefaultModal from '../components/default-modal'
import { useAuth } from '../context/auth-context'
import { getUserById } from '../api/user-service'
import {
    getChatByParticipants,
    createChat,
    sendMessage,
} from '../api/chat-service'
import { calculateDistance, getRoutingDistance, formatDistance, formatDuration } from '../utils/geolocation'
import { useLocation } from '../context/location-context'
import GmapsView from '../components/gmaps-view'

export default function BusinessProfile() {
    const params = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const { userCoords, isLoadingLocation } = useLocation()
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
    const [message, setMessage] = React.useState(
        'Hola. ¿Sigue estando disponible?'
    )
    const [chat, setChat] = React.useState(null)
    const [modalVisible, setModalVisible] = React.useState(false)
    const [distance, setDistance] = React.useState(null)
    const [routingInfo, setRoutingInfo] = React.useState(null) // { distance, duration } de OSRM
    const [loadingRouting, setLoadingRouting] = React.useState(false)
    const [showMap, setShowMap] = React.useState(false)

    const fetchOwner = async ownerId => {
        try {
            const foundOwner = await getUserById(ownerId)
            setOwner(foundOwner)
            console.log('Owner:', foundOwner)
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

    const handleChatPress = async () => {
        try {
            console.log('🚀 Iniciando chat:', {
                currentUser: user?._id,
                owner: owner?._id,
            })

            if (!user?._id || !owner?._id) {
                Alert.alert(
                    'Error',
                    'No se puede iniciar el chat. Usuario u owner no encontrado.'
                )
                return
            }

            let chat
            try {
                chat = await getChatByParticipants(user._id, owner._id)
                console.log('✅ Chat existente encontrado:', chat._id)
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log('📝 Chat no existe, creando uno nuevo...')
                    chat = await createChat({
                        participants: [user._id, owner._id],
                        lastMessage: null,
                        lastMessageTimestamp: new Date().toISOString(),
                    })
                    setChat(chat)
                } else {
                    throw error
                }
            }

            await newMessage(chat)
            setModalVisible(true)
        } catch (error) {
            console.error('❌ Error en handleChatPress:', error)
            Alert.alert('Error', 'No se pudo iniciar el chat')
        }
    }

    const newMessage = async chatObj => {
        if (!message.trim()) return

        const messageData = {
            chatId: chatObj._id,
            sender_id: user.id || user._id,
            content: message,
            read: false,
            timestamp: new Date().toISOString(),
        }

        try {
            console.log('Sending message:', messageData)
            setMessage('')
            await sendMessage(messageData)
        } catch (error) {
            console.error('Error sending message:', error)
            setMessage(messageData.content)
        }
    }

    // Calcular distancia aproximada cuando tenemos ambas coordenadas desde el contexto
    React.useEffect(() => {
        if (userCoords && business?.latitude && business?.longitude) {
            // Primero calcular distancia aproximada (con factor urbano)
            const dist = calculateDistance(
                userCoords.latitude,
                userCoords.longitude,
                business.latitude,
                business.longitude,
                true // Factor urbano
            )
            setDistance(dist)
            console.log('📏 Distancia aproximada:', dist)
        }
    }, [userCoords, business])

    // Obtener distancia real por carretera (OSRM) cuando se muestran los detalles
    React.useEffect(() => {
        let mounted = true

        const fetchRoutingDistance = async () => {
            if (userCoords && business?.latitude && business?.longitude) {
                setLoadingRouting(true)
                try {
                    const routing = await getRoutingDistance(
                        userCoords.latitude,
                        userCoords.longitude,
                        business.latitude,
                        business.longitude
                    )
                    
                    if (mounted && routing) {
                        setRoutingInfo(routing)
                        // Actualizar distancia con la real
                        setDistance(routing.distance)
                        console.log('🚗 Distancia real obtenida:', routing)
                    }
                } catch (error) {
                    console.log('⚠️ No se pudo obtener distancia real, usando aproximada')
                } finally {
                    if (mounted) setLoadingRouting(false)
                }
            }
        }

        // Esperar un poco antes de hacer la llamada a OSRM
        const timer = setTimeout(fetchRoutingDistance, 500)

        return () => {
            mounted = false
            clearTimeout(timer)
        }
    }, [userCoords, business])

    React.useEffect(() => {
        let mounted = true

        const fetch = async () => {
            try {
                setLoading(true)
                const foundBusiness = await getBusiness(id)
                if (!mounted) return

                setBusiness(foundBusiness)

                if (foundBusiness && foundBusiness.owner_id) {
                    await fetchOwner(foundBusiness.owner_id)
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
                setBusiness(null)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        if (id) {
            fetch()
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
        <Screen>
            <View>
                <Ionicons
                    name="business"
                    size={48}
                    color="#6A4C93"
                    style={{ alignSelf: 'center', marginBottom: 16 }}
                />

                <Text
                    style={{
                        color: colors.textSecondary,
                        fontSize: 24,
                        fontWeight: '600',
                        marginBottom: 8,
                    }}
                >
                    {business?.name ?? 'Sin nombre'}
                </Text>

                <Text
                    style={[
                        globalStyles.subtitle,
                        {
                            color: colors.textSecondary,
                            alignSelf: 'flex-start',
                        },
                    ]}
                >
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
                <Text style={{ color: '#555', marginBottom: 8 }}>
                    {business?.address ?? 'Sin ubicación'}
                </Text>

                {/* Distancia y mapa */}
                {business?.latitude && business?.longitude && (
                    <View style={{ marginTop: 8, marginBottom: 16 }}>
                        {/* Mostrar distancia y tiempo */}
                        {!isLoadingLocation && distance && (
                            <View style={{
                                marginBottom: 12,
                                backgroundColor: '#F5F0FF',
                                padding: 12,
                                borderRadius: 8,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: routingInfo ? 6 : 0 }}>
                                    <Ionicons name="navigate-outline" size={20} color="#9B59B6" />
                                    <Text style={{
                                        marginLeft: 8,
                                        fontSize: 14,
                                        color: '#6A4C93',
                                        fontWeight: '600',
                                    }}>
                                        {routingInfo 
                                            ? `${formatDistance(distance)} por carretera`
                                            : `${formatDistance(distance, true)} de tu ubicación`
                                        }
                                    </Text>
                                    {loadingRouting && (
                                        <Text style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>
                                            Calculando ruta...
                                        </Text>
                                    )}
                                </View>
                                {routingInfo && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 28 }}>
                                        <Ionicons name="time-outline" size={16} color="#9B59B6" />
                                        <Text style={{
                                            marginLeft: 6,
                                            fontSize: 13,
                                            color: '#6A4C93',
                                        }}>
                                            Aprox. {formatDuration(routingInfo.duration)} en auto
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Botón Cómo llegar */}
                        {userCoords && (
                            <>
                                <Pressable
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#9B59B6',
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        borderRadius: 8,
                                        marginBottom: 12,
                                    }}
                                    onPress={() => setShowMap(!showMap)}
                                >
                                    <Ionicons name="map-outline" size={20} color="#FFF" />
                                    <Text style={{
                                        marginLeft: 8,
                                        color: '#FFF',
                                        fontSize: 15,
                                        fontWeight: '600',
                                    }}>
                                        {showMap ? 'Ocultar mapa' : 'Cómo llegar'}
                                    </Text>
                                </Pressable>

                                {/* Mapa con ruta */}
                                {showMap && (
                                    <View style={{ 
                                        height: 250, 
                                        width: '100%', 
                                        borderRadius: 12, 
                                        overflow: 'hidden',
                                        marginBottom: 12,
                                    }}>
                                        <GmapsView
                                            latitude={business.latitude}
                                            longitude={business.longitude}
                                            userLatitude={userCoords.latitude}
                                            userLongitude={userCoords.longitude}
                                            height={250}
                                        />
                                    </View>
                                )}
                            </>
                        )}

                        {/* Si no hay ubicación del usuario pero sí del negocio, mostrar solo el pin */}
                        {!userCoords && !isLoadingLocation && (
                            <>
                                <Pressable
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#9B59B6',
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        borderRadius: 8,
                                        marginBottom: 12,
                                    }}
                                    onPress={() => setShowMap(!showMap)}
                                >
                                    <Ionicons name="location-outline" size={20} color="#FFF" />
                                    <Text style={{
                                        marginLeft: 8,
                                        color: '#FFF',
                                        fontSize: 15,
                                        fontWeight: '600',
                                    }}>
                                        {showMap ? 'Ocultar mapa' : 'Ver en el mapa'}
                                    </Text>
                                </Pressable>

                                {showMap && (
                                    <View style={{ 
                                        height: 250, 
                                        width: '100%', 
                                        borderRadius: 12, 
                                        overflow: 'hidden',
                                        marginBottom: 12,
                                    }}>
                                        <GmapsView
                                            latitude={business.latitude}
                                            longitude={business.longitude}
                                            height={250}
                                        />
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}

                <Text style={globalStyles.subtitle}>¿Tienes preguntas?</Text>
                <TextInput
                    style={globalStyles.textField}
                    placeholder="Hola. ¿Sigue estando disponible?"
                    value={message}
                    onChangeText={setMessage}
                />

                <Pressable
                    style={[
                        globalStyles.button,
                        { opacity: message.trim() === '' ? 0.5 : 1 },
                    ]}
                    onPress={message.trim() === '' ? null : handleChatPress}
                    disabled={message.trim() === ''}
                >
                    {message.trim() === '' ? (
                        <Text style={globalStyles.buttonText}>
                            Escribe un mensaje
                        </Text>
                    ) : (
                        <Text style={globalStyles.buttonText}>Enviar</Text>
                    )}
                </Pressable>
            </View>

            {modalVisible && (
                <DefaultModal
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <Text style={globalStyles.title}>Mensaje enviado</Text>
                    <Text style={globalStyles.subtitle}>
                        Tu mensaje ha sido enviado al propietario del negocio.
                    </Text>
                    <Pressable
                        style={globalStyles.button}
                        onPress={() => {
                            setModalVisible(false)
                            router.push(`/chat-view?chatId=${chat._id}`)
                        }}
                    >
                        <Text style={globalStyles.buttonText}>Ir al chat</Text>
                    </Pressable>
                </DefaultModal>
            )}
        </Screen>
    )
}
