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
            Alert.alert(
                'Inicio de sesión requerido',
                'Debes iniciar sesión para solicitar un servicio.',
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

        try {
            const serviceData = {
                name: 'Solicitud de servicio',
                description:
                    'Solicitud de servicio para ' +
                    (business?.name ?? 'negocio'),
                price: 0.0,
                state: 'pending',
                business_id: business?._id,
                client_id: user?._id,
            }

            await requestService(serviceData)

            // Crear notificación para el propietario
            await createNotification({
                targetUserId: business?.owner_id,
                type: 'service_request',
                message: `${user?.name || 'Un usuario'} ha solicitado un servicio`,
                date: new Date().toISOString(),
                read: false,
                reference: {
                    originUserId: user?._id,
                    businessId: business?._id,
                },
            })

            Alert.alert(
                '¡Solicitud enviada!',
                'Tu solicitud ha sido enviada al propietario del negocio. Te notificaremos cuando responda.',
                [{ text: 'Entendido' }]
            )
        } catch (error) {
            console.error('Error al solicitar servicio:', error)
            Alert.alert(
                'Error',
                'No se pudo enviar la solicitud. Por favor, intenta nuevamente.'
            )
        }
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

                <Text style={globalStyles.subtitle}>Solicitar servicio</Text>
                <Text style={{ color: '#666', marginBottom: 12, fontSize: 14 }}>
                    ¿Te interesa este negocio? Solicita un servicio y el
                    propietario te contactará.
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
                        name="checkmark-circle-outline"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={globalStyles.buttonText}>
                        Solicitar servicio
                    </Text>
                </Pressable>

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
