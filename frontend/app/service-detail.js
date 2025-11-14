import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
} from 'react-native'
import { useSearchParams } from 'expo-router/build/hooks'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { globalStyles, colors } from '../styles/global'
import { useAuth } from '../context/auth-context'
import {
    getServices,
    getBusiness,
    requestPayment,
    payService,
} from '../api/business-service'
import { createChat } from '../api/chat-service'
import { createNotification } from '../api/notifications-service'
import LoadingSpinner from '../components/loading-spinner'
import Screen from '../components/screen'

export default function ServiceDetail() {
    const params = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()

    const serviceIdRaw = params?.get('id') ?? null
    const serviceId = serviceIdRaw
        ? decodeURIComponent(String(serviceIdRaw))
        : null

    const [service, setService] = React.useState(null)
    const [business, setBusiness] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [price, setPrice] = React.useState('')
    const [isOwner, setIsOwner] = React.useState(false)

    React.useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            try {
                setLoading(true)
                const [servicesData, businessData] = await Promise.all([
                    getServices(),
                    getBusiness(),
                ])

                if (!mounted) return

                // Encontrar el servicio específico
                const foundService = servicesData.find(
                    s => (s.id || s._id) === serviceId
                )

                if (foundService) {
                    setService(foundService)
                    setPrice(foundService.price?.toString() || '')

                    // Encontrar el negocio relacionado
                    const foundBusiness = businessData.find(
                        b => (b.id || b._id) === foundService.business_id
                    )
                    setBusiness(foundBusiness)

                    // Verificar si el usuario es el dueño
                    const userId = user?.id || user?._id
                    setIsOwner(
                        foundBusiness && foundBusiness.owner_id === userId
                    )
                }
            } catch (error) {
                console.error('Error fetching service:', error)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        if (serviceId) {
            fetchData()
        } else {
            setLoading(false)
        }

        return () => {
            mounted = false
        }
    }, [serviceId, user])

    const handleSendPaymentRequest = async () => {
        try {
            const parsed = parseFloat(price)
            if (isNaN(parsed) || parsed <= 0) {
                alert('Ingrese un monto válido')
                return
            }

            await requestPayment(serviceId, parsed)
            // Refrescar datos
            const [servicesData, businessData] = await Promise.all([
                getServices(),
                getBusiness(),
            ])
            const updated = servicesData.find(
                s => (s.id || s._id) === serviceId
            )
            setService(updated)
            const foundBusiness = businessData.find(
                b => (b.id || b._id) === updated.business_id
            )
            setBusiness(foundBusiness)
            alert('Solicitud de cobro enviada')
        } catch (error) {
            console.error('Error requesting payment:', error)
            alert('Error al enviar la solicitud de cobro')
        }
    }

    const handlePay = async () => {
        try {
            await payService(serviceId)
            const [servicesData, businessData] = await Promise.all([
                getServices(),
                getBusiness(),
            ])
            const updated = servicesData.find(
                s => (s.id || s._id) === serviceId
            )
            setService(updated)
            sendNotificationToOwner(
                'Servicio pagado',
                `El servicio "${updated.name}" ha sido pagado por el cliente.`
            )
            const foundBusiness = businessData.find(
                b => (b.id || b._id) === updated.business_id
            )
            setBusiness(foundBusiness)

            sendNotificacionToClient(
                'Danos tu opinión',
                `Por favor, califica y deja una reseña para el servicio "${updated.name}".`
            )
            alert('Pago realizado con éxito')
        } catch (error) {
            console.error('Error paying service:', error)
            alert('Error al realizar el pago')
        }
    }

    const sendNotificationToOwner = async (title, message) => {
        if (!business) return
        const notificationData = {
            targetUserId: business.owner_id,
            type: 'service_payment',
            message: message,
            date: new Date().toISOString(),
            read: false,
            reference: {
                serviceId: serviceId,
                title: title,
            },
        }
        try {
            await createNotification(notificationData)
        } catch (error) {
            console.error('Error creating notification:', error)
        }
    }

    const sendNotificacionToClient = async (title, message) => {
        if (!service) return
        const notificationData = {
            targetUserId: service.client_id,
            type: 'service_review',
            message: message,
            date: new Date().toISOString(),
            read: false,
            reference: {
                serviceId: serviceId,
                title: title,
            },
        }
        try {
            await createNotification(notificationData)
        } catch (error) {
            console.error('Error creating notification:', error)
        }
    }

    const handleChatPress = async () => {
        const chatData = {
            participants: [user.id || user._id, business?.owner_id],
            messages: [],
        }
        try {
            await createChat(chatData)
            router.push('/chat')
        } catch (error) {
            console.error('Error creating chat:', error)
            alert('Error al crear el chat')
            return
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

    if (!service) {
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
                        Servicio no encontrado
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
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
                    name="clipboard"
                    size={48}
                    color="#6A4C93"
                    style={{ alignSelf: 'center', marginBottom: 16 }}
                />

                <Text style={globalStyles.title}>{service.name}</Text>

                <Text style={[globalStyles.badge, { alignSelf: 'center' }]}>
                    Estado: {service.state}
                </Text>

                <Text style={globalStyles.subtitle}>Descripción</Text>
                <Text style={styles.infoText}>{service.description}</Text>

                {business && (
                    <>
                        <Text style={globalStyles.subtitle}>Negocio</Text>
                        <Text style={styles.infoText}>{business.name}</Text>
                    </>
                )}

                <Text style={globalStyles.subtitle}>Precio Actual</Text>
                <Text style={styles.priceText}>${service.price}</Text>

                {service.requested_price != null && (
                    <>
                        <Text style={globalStyles.subtitle}>
                            Precio solicitado
                        </Text>
                        <Text style={styles.priceText}>
                            ${service.requested_price}
                        </Text>
                    </>
                )}

                {isOwner && service.state === 'in progress' && (
                    <>
                        <Text style={globalStyles.subtitle}>
                            Establecer Precio del Servicio
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingrese el precio"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />

                        <Pressable
                            style={styles.submitButton}
                            onPress={handleSendPaymentRequest}
                            disabled={!price || parseFloat(price) <= 0}
                        >
                            <Text style={styles.submitButtonText}>
                                Enviar Solicitud de Cobro
                            </Text>
                        </Pressable>
                    </>
                )}

                {!isOwner && (
                    <>
                        {service.state === 'payment_requested' ? (
                            <View style={styles.clientInfo}>
                                <Text style={styles.priceText}>
                                    Precio solicitado: $
                                    {service.requested_price}
                                </Text>
                                <Pressable
                                    style={styles.submitButton}
                                    onPress={handlePay}
                                >
                                    <Text style={styles.submitButtonText}>
                                        Pagar
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View style={styles.clientInfo}>
                                <Ionicons
                                    name="information-circle"
                                    size={24}
                                    color="#6A4C93"
                                />
                                <Text style={styles.clientInfoText}>
                                    Solo el vendedor puede establecer el precio
                                    del servicio
                                </Text>
                            </View>
                        )}
                    </>
                )}

                <Pressable
                    onPress={handleChatPress}
                    style={globalStyles.button}
                >
                    <Text style={[{ color: 'white' }]}>Ir al chat</Text>
                </Pressable>
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    backText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '600',
    },
    infoText: {
        color: '#555',
        marginBottom: 16,
        fontSize: 14,
    },
    priceText: {
        color: '#6A4C93',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    submitButton: {
        backgroundColor: '#6A4C93',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0E6FF',
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
    },
    clientInfoText: {
        color: '#6A4C93',
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
    },
})
