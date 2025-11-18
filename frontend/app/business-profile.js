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
import { getReviewsByBusiness } from '../api/review-service'

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
    const [message, setMessage] = React.useState(
        'Hola. ¿Sigue estando disponible?'
    )
    const [chat, setChat] = React.useState(null)
    const [modalVisible, setModalVisible] = React.useState(false)
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
                <Text style={{ color: '#555', marginBottom: 24 }}>
                    {business?.address ?? 'Sin ubicación'}
                </Text>

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
                            <Text style={{ color: '#555', lineHeight: 20 }}>
                                {review.comment || ''}
                            </Text>
                            {review.date && (
                                <Text
                                    style={{
                                        color: '#999',
                                        fontSize: 12,
                                        marginTop: 8,
                                    }}
                                >
                                    {new Date(review.date).toLocaleDateString(
                                        'es-ES',
                                        {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        }
                                    )}
                                </Text>
                            )}
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
                            router.push(`/chat-view?chatId=${chat?._id}`)
                        }}
                    >
                        <Text style={globalStyles.buttonText}>Ir al chat</Text>
                    </Pressable>
                </DefaultModal>
            )}
        </Screen>
    )
}
