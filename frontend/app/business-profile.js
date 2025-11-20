import React from 'react'
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Button,
    TextInput,
    Alert,
    Image,
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
import {
    calculateDistance,
    getRoutingDistance,
    formatDistance,
    formatDuration,
} from '../utils/geolocation'
import { useLocation } from '../context/location-context'
import GmapsView from '../components/gmaps-view'
import { getReviewsByBusiness } from '../api/review-service'

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
    const [routingInfo, setRoutingInfo] = React.useState(null)
    const [loadingRouting, setLoadingRouting] = React.useState(false)
    const [showMap, setShowMap] = React.useState(false)
    const [reviews, setReviews] = React.useState([])

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

    const fetchReviews = async businessId => {
        try {
            const reviewsData = await getReviewsByBusiness(businessId)
            console.log('Reviews for business:', reviewsData)
            setReviews(reviewsData)
        } catch (error) {
            console.error('Error fetching reviews:', error)
        }
    }

    const handleChatPress = async () => {
        try {
            console.log('🚀 Iniciando chat:', {
                currentUser: user?._id || user?.id,
                owner: owner?._id || owner?.id,
            })

            const currentUserId = user?._id || user?.id
            const ownerId = owner?._id || owner?.id

            if (!currentUserId || !ownerId) {
                Alert.alert(
                    'Error',
                    'No se puede iniciar el chat. Usuario u owner no encontrado.'
                )
                return
            }

            let chatData
            try {
                // Intentar obtener chat existente
                chatData = await getChatByParticipants(currentUserId, ownerId)
                console.log(
                    '✅ Chat existente encontrado:',
                    chatData._id || chatData.id
                )
            } catch (error) {
                if (error.response?.status === 404) {
                    // Crear nuevo chat si no existe
                    console.log('📝 Creando nuevo chat...')
                    chatData = await createChat({
                        participants: [currentUserId, ownerId],
                        lastMessage: null,
                        lastMessageTimestamp: new Date().toISOString(),
                    })
                    console.log(
                        '✅ Nuevo chat creado:',
                        chatData._id || chatData.id
                    )
                } else {
                    throw error
                }
            }

            setChat(chatData)

            // Enviar mensaje
            await newMessage(chatData)

            setModalVisible(true)
        } catch (error) {
            console.error('❌ Error en handleChatPress:', error)
            Alert.alert('Error', 'No se pudo iniciar el chat')
        }
    }

    const newMessage = async chatObj => {
        if (!message.trim()) return

        // Obtener el ID del chat correctamente
        const chatId = chatObj._id || chatObj.id

        if (!chatId) {
            console.error('❌ No se pudo obtener el chatId:', chatObj)
            throw new Error('Chat ID no válido')
        }

        const messageData = {
            chatId: chatId,
            sender_id: user.id || user._id,
            content: message.trim(),
            read: false,
            timestamp: new Date().toISOString(),
        }

        try {
            console.log('📤 Sending message:', messageData)
            setMessage('')
            await sendMessage(messageData)
            console.log('✅ Mensaje enviado correctamente')
        } catch (error) {
            console.error('❌ Error sending message:', error)
            setMessage(messageData.content)
            throw error
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
                    console.log(
                        '⚠️ No se pudo obtener distancia real, usando aproximada'
                    )
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

                // Cargar reseñas del negocio
                if (foundBusiness && (foundBusiness._id || foundBusiness.id)) {
                    await fetchReviews(foundBusiness._id || foundBusiness.id)
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

    const handleRequestService = () => {
        if (!user) {
            Alert.alert(
                'Inicio de sesión requerido',
                'Debes iniciar sesión para reservar un servicio.',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                    {
                        text: 'Iniciar sesión',
                        onPress: () => router.push('/login'),
                    },
                ]
            )
            return
        }

        // Redirigir a la pantalla de reservas
        router.push({
            pathname: '/book-a-service',
            params: {
                businessId: business?._id || business?.id,
                businessName: business?.name || 'Negocio',
            },
        })
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
                <Image
                    source={
                        business?.profile_pic
                            ? { uri: business.profile_pic }
                            : require('../assets/default-profile-pic.svg')
                    }
                    style={{
                        width: '100%',
                        height: 200,
                        borderRadius: 8,
                        marginBottom: 16,
                    }}
                    resizeMode="cover"
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
                            <View
                                style={{
                                    marginBottom: 12,
                                    backgroundColor: '#F5F0FF',
                                    padding: 12,
                                    borderRadius: 8,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: routingInfo ? 6 : 0,
                                    }}
                                >
                                    <Ionicons
                                        name="navigate-outline"
                                        size={20}
                                        color="#9B59B6"
                                    />
                                    <Text
                                        style={{
                                            marginLeft: 8,
                                            fontSize: 14,
                                            color: '#6A4C93',
                                            fontWeight: '600',
                                        }}
                                    >
                                        {routingInfo
                                            ? `${formatDistance(distance)} por carretera`
                                            : `${formatDistance(distance, true)} de tu ubicación`}
                                    </Text>
                                    {loadingRouting && (
                                        <Text
                                            style={{
                                                marginLeft: 8,
                                                fontSize: 12,
                                                color: '#999',
                                            }}
                                        >
                                            Calculando ruta...
                                        </Text>
                                    )}
                                </View>
                                {routingInfo && (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginLeft: 28,
                                        }}
                                    >
                                        <Ionicons
                                            name="time-outline"
                                            size={16}
                                            color="#9B59B6"
                                        />
                                        <Text
                                            style={{
                                                marginLeft: 6,
                                                fontSize: 13,
                                                color: '#6A4C93',
                                            }}
                                        >
                                            Aprox.{' '}
                                            {formatDuration(
                                                routingInfo.duration
                                            )}{' '}
                                            en auto
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
                                    <Ionicons
                                        name="map-outline"
                                        size={20}
                                        color="#FFF"
                                    />
                                    <Text
                                        style={{
                                            marginLeft: 8,
                                            color: '#FFF',
                                            fontSize: 15,
                                            fontWeight: '600',
                                        }}
                                    >
                                        {showMap
                                            ? 'Ocultar mapa'
                                            : 'Cómo llegar'}
                                    </Text>
                                </Pressable>

                                {/* Mapa con ruta */}
                                {showMap && (
                                    <View
                                        style={{
                                            height: 250,
                                            width: '100%',
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            marginBottom: 12,
                                        }}
                                    >
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
                                    <Ionicons
                                        name="location-outline"
                                        size={20}
                                        color="#FFF"
                                    />
                                    <Text
                                        style={{
                                            marginLeft: 8,
                                            color: '#FFF',
                                            fontSize: 15,
                                            fontWeight: '600',
                                        }}
                                    >
                                        {showMap
                                            ? 'Ocultar mapa'
                                            : 'Ver en el mapa'}
                                    </Text>
                                </Pressable>

                                {showMap && (
                                    <View
                                        style={{
                                            height: 250,
                                            width: '100%',
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            marginBottom: 12,
                                        }}
                                    >
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

                <View
                    style={{
                        borderTopWidth: 1,
                        borderTopColor: '#E0E0E0',
                        marginVertical: 20,
                    }}
                />

                {/* Mostrar botón de gestión si es el dueño del negocio */}
                {String(business?.owner_id) === String(user?._id) ? (
                    <>
                        <Text style={globalStyles.subtitle}>
                            Gestión del negocio
                        </Text>
                        <Text
                            style={{
                                color: '#666',
                                marginBottom: 12,
                                fontSize: 14,
                            }}
                        >
                            Configura la disponibilidad y gestiona las reservas
                            de tu negocio.
                        </Text>
                        <Pressable
                            style={[
                                globalStyles.button,
                                {
                                    marginBottom: 20,
                                    backgroundColor: '#FF6B6B',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                            ]}
                            onPress={() =>
                                router.push({
                                    pathname: '/bookings-panel',
                                    params: {
                                        businessId:
                                            business?._id || business?.id,
                                        businessName:
                                            business?.name || 'Negocio',
                                    },
                                })
                            }
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color="#fff"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={globalStyles.buttonText}>
                                Ver Solicitudes
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                globalStyles.button,
                                {
                                    flexDirection: 'row',
                                    backgroundColor: '#666',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: 12,
                                },
                            ]}
                            onPress={() =>
                                router.push({
                                    pathname: '/manage-availavility',
                                    params: {
                                        businessId:
                                            business?._id || business?.id,
                                    },
                                })
                            }
                        >
                            <Ionicons
                                name="settings-outline"
                                size={20}
                                color="#fff"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={globalStyles.buttonText}>
                                Configurar Disponibilidad
                            </Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <Text style={globalStyles.subtitle}>
                            Reservar servicio
                        </Text>
                        <Text
                            style={{
                                color: '#666',
                                marginBottom: 12,
                                fontSize: 14,
                            }}
                        >
                            ¿Te interesa este negocio? Reserva una fecha y
                            horario para recibir el servicio.
                        </Text>
                        <Pressable
                            style={[
                                globalStyles.button,
                                {
                                    marginBottom: 20,
                                    backgroundColor: '#4CAF50',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                            ]}
                            onPress={handleRequestService}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color="#fff"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={globalStyles.buttonText}>
                                Reservar servicio
                            </Text>
                        </Pressable>
                    </>
                )}

                <View
                    style={{
                        borderTopWidth: 1,
                        borderTopColor: '#E0E0E0',
                        marginVertical: 20,
                    }}
                />

                <Text style={globalStyles.subtitle}>Reseñas</Text>
                {reviews.length === 0 ? (
                    <Text style={{ color: '#666', marginBottom: 16 }}>
                        No hay reseñas aún.
                    </Text>
                ) : (
                    reviews.map((review, index) => (
                        <View key={index} style={globalStyles.card}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: '600',
                                        fontSize: 16,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    {review.userName || 'Anónimo'}
                                </Text>
                                <View style={{ flexDirection: 'row' }}>
                                    {[...Array(review.rating || 5)].map(
                                        (_, i) => (
                                            <Ionicons
                                                key={i}
                                                name="star"
                                                size={16}
                                                color="#FFD700"
                                            />
                                        )
                                    )}
                                </View>
                            </View>
                            <Text style={{ color: '#666', fontSize: 14 }}>
                                {review.comment || 'Sin comentarios'}
                            </Text>
                        </View>
                    ))
                )}

                <View
                    style={{
                        borderTopWidth: 1,
                        borderTopColor: '#E0E0E0',
                        marginVertical: 20,
                    }}
                />

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
                        {
                            opacity: message.trim() === '' ? 0.5 : 1,
                            backgroundColor: '#9B59B6',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                    ]}
                    onPress={message.trim() === '' ? null : handleChatPress}
                    disabled={message.trim() === ''}
                >
                    <Ionicons
                        name={
                            message.trim() === ''
                                ? 'chatbubble-outline'
                                : 'send'
                        }
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    {message.trim() === '' ? (
                        <Text style={globalStyles.buttonText}>
                            Escribe un mensaje
                        </Text>
                    ) : (
                        <Text style={globalStyles.buttonText}>
                            Enviar mensaje
                        </Text>
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
                            // ✅ CORRECCIÓN: Pasar el chatId correctamente
                            const chatId = chat?._id || chat?.id
                            console.log('🔗 Navegando al chat:', chatId)

                            if (chatId) {
                                router.push(`/chat-view?chatId=${chatId}`)
                            } else {
                                console.error('❌ No hay chatId disponible')
                                Alert.alert('Error', 'No se pudo abrir el chat')
                            }
                        }}
                    >
                        <Text style={globalStyles.buttonText}>Ir al chat</Text>
                    </Pressable>
                </DefaultModal>
            )}
        </Screen>
    )
}
