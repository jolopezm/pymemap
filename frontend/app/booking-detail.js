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
import { useAuth } from '../context/auth-context'
import Screen from '../components/screen'
import LoadingSpinner from '../components/loading-spinner'
import { globalStyles } from '../styles/global'
import { 
    getAllMyBusinessBookings, 
    getMyBookings, 
    requestBookingPayment, 
    payBooking 
} from '../api/booking-service'
import { getBusiness } from '../api/business-service'
import { createNotification } from '../api/notifications-service'
import { createChat } from '../api/chat-service'

export default function BookingDetail() {
    const params = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()

    const bookingIdRaw = params?.get('id') ?? null
    const bookingId = bookingIdRaw
        ? decodeURIComponent(String(bookingIdRaw))
        : null

    const [booking, setBooking] = React.useState(null)
    const [business, setBusiness] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [price, setPrice] = React.useState('')
    const [isOwner, setIsOwner] = React.useState(false)

    React.useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            try {
                setLoading(true)
                
                // Obtener todas las reservas (tanto como propietario como cliente)
                const [businessBookings, clientBookings, businessData] = await Promise.all([
                    getAllMyBusinessBookings().catch(() => []),
                    getMyBookings().catch(() => []),
                    getBusiness(),
                ])

                if (!mounted) return

                // Buscar la reserva en ambas listas
                let foundBooking = businessBookings.find(
                    b => (b.id || b._id) === bookingId
                )
                
                if (!foundBooking) {
                    foundBooking = clientBookings.find(
                        b => (b.id || b._id) === bookingId
                    )
                }

                if (foundBooking) {
                    setBooking(foundBooking)
                    setPrice(foundBooking.requested_price?.toString() || '')

                    // Encontrar el negocio relacionado
                    const foundBusiness = businessData.find(
                        b => (b.id || b._id) === foundBooking.business_id
                    )
                    setBusiness(foundBusiness)

                    // Verificar si el usuario es el dueño del negocio
                    const userId = user?.id || user?._id
                    setIsOwner(
                        foundBusiness && foundBusiness.owner_id === userId
                    )
                }
            } catch (error) {
                console.error('Error fetching booking:', error)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        if (bookingId) {
            fetchData()
        } else {
            setLoading(false)
        }

        return () => {
            mounted = false
        }
    }, [bookingId, user])

    const handleSendPaymentRequest = async () => {
        try {
            const parsed = parseFloat(price)
            if (isNaN(parsed) || parsed <= 0) {
                alert('Ingrese un monto válido')
                return
            }

            await requestBookingPayment(bookingId, parsed)
            
            // Refrescar datos
            const [businessBookings, clientBookings, businessData] = await Promise.all([
                getAllMyBusinessBookings().catch(() => []),
                getMyBookings().catch(() => []),
                getBusiness(),
            ])
            
            let updated = businessBookings.find(b => (b.id || b._id) === bookingId)
            if (!updated) {
                updated = clientBookings.find(b => (b.id || b._id) === bookingId)
            }
            
            setBooking(updated)
            const foundBusiness = businessData.find(
                b => (b.id || b._id) === updated.business_id
            )
            setBusiness(foundBusiness)
            
            // Enviar notificación al cliente (sin botón de calificar)
            await sendNotificationToClient(
                'Solicitud de pago',
                `El vendedor solicita $${parsed} por tu reserva del ${booking.date} a las ${booking.start_time}`,
                false // No incluir acción de calificar
            )
            
            alert('Solicitud de cobro enviada')
        } catch (error) {
            console.error('Error requesting payment:', error)
            alert('Error al enviar la solicitud de cobro')
        }
    }

    const handlePay = async () => {
        try {
            await payBooking(bookingId)
            
            // Refrescar datos
            const [businessBookings, clientBookings, businessData] = await Promise.all([
                getAllMyBusinessBookings().catch(() => []),
                getMyBookings().catch(() => []),
                getBusiness(),
            ])
            
            let updated = businessBookings.find(b => (b.id || b._id) === bookingId)
            if (!updated) {
                updated = clientBookings.find(b => (b.id || b._id) === bookingId)
            }
            
            setBooking(updated)
            const foundBusiness = businessData.find(
                b => (b.id || b._id) === updated.business_id
            )
            setBusiness(foundBusiness)

            // Enviar notificación al vendedor
            await sendNotificationToOwner(
                'Reserva pagada',
                `La reserva del ${updated.date} a las ${updated.start_time} ha sido pagada por el cliente.`
            )
            
            alert('Pago realizado con éxito')
        } catch (error) {
            console.error('Error paying booking:', error)
            alert('Error al realizar el pago')
        }
    }

    const sendNotificationToOwner = async (title, message) => {
        if (!business) return
        const notificationData = {
            targetUserId: business.owner_id,
            type: 'booking_payment',
            message: message,
            date: new Date().toISOString(),
            reference: {
                bookingId: bookingId,
                businessId: business.id || business._id,
                title: title,
            },
        }
        try {
            await createNotification(notificationData)
        } catch (error) {
            console.error('Error creating notification:', error)
        }
    }

    const sendNotificationToClient = async (title, message, includeRateAction = false) => {
        if (!booking) return
        const notificationData = {
            targetUserId: booking.client_id,
            type: includeRateAction ? 'booking_review' : 'booking_payment',
            message: message,
            date: new Date().toISOString(),
            reference: {
                bookingId: bookingId,
                businessId: business?.id || business?._id,
                businessName: business?.name || 'el negocio',
                title: title,
            },
        }
        
        // Solo agregar acción de calificar si se solicita explícitamente
        if (includeRateAction) {
            notificationData.reference.action = 'rate_business'
            notificationData.reference.actionLabel = 'Calificar'
        }
        try {
            await createNotification(notificationData)
        } catch (error) {
            console.error('Error creating notification:', error)
        }
    }

    const handleChatPress = async () => {
        const otherUserId = isOwner ? booking?.client_id : business?.owner_id
        const chatData = {
            participants: [user.id || user._id, otherUserId],
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

    const getStatusText = (status) => {
        const statusMap = {
            pending: 'Pendiente',
            confirmed: 'Confirmada',
            payment_requested: 'Pago solicitado',
            completed: 'Completada',
            cancelled: 'Cancelada'
        }
        return statusMap[status] || status
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

    if (!booking) {
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
                        Reserva no encontrada
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
                    name="calendar"
                    size={48}
                    color="#6A4C93"
                    style={{ alignSelf: 'center', marginBottom: 16 }}
                />

                <Text style={globalStyles.title}>Detalle de Reserva</Text>

                <Text style={[globalStyles.badge, { alignSelf: 'center' }]}>
                    Estado: {getStatusText(booking.status)}
                </Text>

                {business && (
                    <>
                        <Text style={globalStyles.subtitle}>Negocio</Text>
                        <Text style={styles.infoText}>{business.name}</Text>
                    </>
                )}

                <Text style={globalStyles.subtitle}>Fecha y Hora</Text>
                <Text style={styles.infoText}>
                    📅 {booking.date} a las {booking.start_time}
                </Text>

                {booking.service_description && (
                    <>
                        <Text style={globalStyles.subtitle}>Descripción</Text>
                        <Text style={styles.infoText}>{booking.service_description}</Text>
                    </>
                )}

                {booking.requested_price != null && (
                    <>
                        <Text style={globalStyles.subtitle}>
                            Precio solicitado
                        </Text>
                        <Text style={styles.priceText}>
                            ${booking.requested_price}
                        </Text>
                    </>
                )}

                {isOwner && booking.status === 'confirmed' && (
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
                        {booking.status === 'payment_requested' ? (
                            <View style={styles.clientInfo}>
                                <Text style={styles.priceText}>
                                    Precio solicitado: $
                                    {booking.requested_price}
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
                                    {booking.status === 'pending' 
                                        ? 'Esperando confirmación del vendedor'
                                        : booking.status === 'confirmed'
                                        ? 'Confirmada - Esperando precio del vendedor'
                                        : 'Solo el vendedor puede establecer el precio'
                                    }
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