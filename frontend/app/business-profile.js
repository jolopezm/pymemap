import React from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { useSearchParams } from 'expo-router/build/hooks'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { globalStyles } from '../styles/theme'
import { getBusiness } from '../api/business-service'
import LoadingSpinner from '../components/loading-spinner'
import LoadingState from '../components/LoadingState'
import Screen from '../components/screen'
import DefaultModal from '../components/default-modal'
import { useAuth } from '../context/auth-context'
import { getUserById } from '../api/user-service'
import { getChatByParticipants, createChat, sendMessage } from '../api/chat-service'
import { calculateDistance, getRoutingDistance } from '../utils/geolocation'
import { useLocation } from '../context/location-context'
import { getReviewsByBusiness } from '../api/review-service'
import {
    BusinessHeader,
    BusinessLocation,
    BusinessActions,
    BusinessReviews,
    BusinessChat,
} from '../components/business'
import logger from '../utils/logger'

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
    const [reviews, setReviews] = React.useState([])

    const fetchOwner = async ownerId => {
        try {
            const foundOwner = await getUserById(ownerId)
            setOwner(foundOwner)
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
            setReviews(reviewsData)
        } catch (error) {
        }
    }

    const handleChatPress = async () => {
        try {
            const currentUserId = user?._id || user?.id
            const ownerId = owner?._id || owner?.id

            if (!currentUserId || !ownerId) {
                Alert.alert(
                    'Error',
                    'No se puede iniciar el chat. Usuario u owner no encontrado.'
                )
                return
            }

            let chatData = null

            chatData = await getChatByParticipants(currentUserId, ownerId)

            if (!chatData) {
                chatData = await createChat({
                    participants: [currentUserId, ownerId],
                    lastMessage: null,
                    lastMessageTimestamp: new Date().toISOString(),
                })
                logger.log(
                    '✅ Nuevo chat creado:',
                    chatData._id || chatData.id
                )
            } else {
                logger.log(
                    '✅ Chat existente encontrado:',
                    chatData._id || chatData.id
                )
            }

            if (!chatData) {
                throw new Error('No se pudo crear o encontrar el chat')
            }

            setChat(chatData)

            await newMessage(chatData)

            setModalVisible(true)
        } catch (error) {
            Alert.alert('Error', 'No se pudo iniciar el chat')
        }
    }

    const newMessage = async chatObj => {
        if (!message.trim()) return

        const chatId = chatObj._id || chatObj.id

        if (!chatId) {
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
            setMessage('')
            await sendMessage(messageData)
        } catch (error) {
            setMessage(messageData.content)
            throw error
        }
    }

    React.useEffect(() => {
        if (userCoords && business?.latitude && business?.longitude) {
            const dist = calculateDistance(
                userCoords.latitude,
                userCoords.longitude,
                business.latitude,
                business.longitude,
                true // Factor urbano
            )
            setDistance(dist)
        }
    }, [userCoords, business])

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
                        setDistance(routing.distance)
                    }
                } catch (error) {
                    logger.log(
                        'No se pudo obtener distancia real, usando aproximada'
                    )
                } finally {
                    if (mounted) setLoadingRouting(false)
                }
            }
        }

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
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Iniciar sesión', onPress: () => router.push('/login') },
                ]
            )
            return
        }

        router.push({
            pathname: '/book-a-service',
            params: {
                businessId: business?._id || business?.id,
                businessName: business?.name || 'Negocio',
            },
        })
    }

    const handleManageBookings = () => {
        router.push({
            pathname: '/bookings-panel',
            params: {
                businessId: business?._id || business?.id,
                businessName: business?.name || 'Negocio',
            },
        })
    }

    const handleEditBusiness = () => {
        router.push({
            pathname: '/edit-business',
            params: { businessId: business?._id || business?.id },
        })
    }

    const isOwner = String(business?.owner_id) === String(user?._id)

    if (loading) {
        return (
            <Screen>
                <LoadingState variant="detail" />
            </Screen>
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
                <BusinessHeader business={business} owner={owner} />

                <BusinessLocation
                    business={business}
                    userCoords={userCoords}
                    distance={distance}
                    routingInfo={routingInfo}
                    loadingRouting={loadingRouting}
                    isLoadingLocation={isLoadingLocation}
                />

                <View style={globalStyles.divider} />

                <BusinessActions
                    isOwner={isOwner}
                    business={business}
                    onManageBookings={handleManageBookings}
                    onEditBusiness={handleEditBusiness}
                    onRequestService={handleRequestService}
                />

                <View style={globalStyles.divider} />

                <BusinessReviews reviews={reviews} />

                <View style={globalStyles.divider} />

                <BusinessChat
                    message={message}
                    onMessageChange={setMessage}
                    onSend={handleChatPress}
                />
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
                            const chatId = chat?._id || chat?.id

                            if (chatId) {
                                router.push(`/chat-view?chatId=${chatId}`)
                            } else {
                                logger.error('❌ No hay chatId disponible')
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
