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
    verifyBookingCode,
} from '../api/booking-service'
import { getBusiness } from '../api/business-service'
import { createNotification } from '../api/notifications-service'
import { getChatByParticipants, createChat } from '../api/chat-service'

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
    const [verificationCode, setVerificationCode] = React.useState('')
    const [isOwner, setIsOwner] = React.useState(false)

    React.useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            try {
                setLoading(true)

                // Obtener todas las reservas (tanto como propietario como cliente)
                const [businessBookings, clientBookings, businessData] =
                    await Promise.all([
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

    const handleVerifyCode = async () => {
        try {
            const code = parseInt(verificationCode)
            if (isNaN(code) || verificationCode.length !== 4) {
                alert('Ingrese un código válido de 4 dígitos')
                return
            }

            await verifyBookingCode(bookingId, code)

            // Refrescar datos
            const [businessBookings, clientBookings, businessData] =
                await Promise.all([
                    getAllMyBusinessBookings().catch(() => []),
                    getMyBookings().catch(() => []),
                    getBusiness(),
                ])

            let updated = businessBookings.find(
                b => (b.id || b._id) === bookingId
            )
            if (!updated) {
                updated = clientBookings.find(
                    b => (b.id || b._id) === bookingId
                )
            }

            setBooking(updated)
            const foundBusiness = businessData.find(
                b => (b.id || b._id) === updated.business_id
            )
            setBusiness(foundBusiness)

            // Enviar notificación al cliente
            await sendNotificationToClient(
                'Servicio completado',
                `Tu servicio del ${booking.date} a las ${booking.start_time} ha sido completado. ¡No olvides calificar!`,
                true // Incluir acción de calificar
            )

            alert('✅ Código verificado - Servicio completado')
        } catch (error) {
            console.error('Error verifying code:', error)
            if (error.response?.status === 400) {
                alert('❌ Código incorrecto. Intenta de nuevo.')
            } else {
                alert('Error al verificar el código')
            }
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

    const sendNotificationToClient = async (
        title,
        message,
        includeRateAction = false
    ) => {
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
        try {
            const currentUserId = user?.id || user?._id
            const otherUserId = isOwner
                ? booking?.client_id
                : business?.owner_id

            if (!currentUserId || !otherUserId) {
                alert(
                    'No se puede abrir el chat. Información de usuario faltante.'
                )
                return
            }

            // Buscar chat existente
            let chat = await getChatByParticipants(currentUserId, otherUserId)

            // Si no existe, crear uno nuevo
            if (!chat) {
                const chatData = {
                    participants: [currentUserId, otherUserId],
                }
                chat = await createChat(chatData)
            }

            // Navegar al chat con el ID correcto
            const chatId = chat._id || chat.id
            router.push(`/chat-view?chatId=${chatId}`)
        } catch (error) {
            console.error('❌ Error al abrir chat:', error)
            alert('Error al abrir el chat. Intenta de nuevo.')
        }
    }

    const getStatusText = status => {
        const statusMap = {
            pending: 'Pendiente',
            confirmed: 'Confirmada',
            payment_requested: 'Pago solicitado',
            completed: 'Completada',
            cancelled: 'Cancelada',
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
                        <Text style={styles.infoText}>
                            {booking.service_description}
                        </Text>
                    </>
                )}

                {booking.requested_price != null && !isOwner && (
                    <>
                        <Text style={globalStyles.subtitle}>
                            Tu Código de Verificación
                        </Text>
                        <View style={styles.codeContainer}>
                            <Text style={styles.codeText}>
                                {booking.requested_price}
                            </Text>
                            <Text style={styles.codeHint}>
                                Muestra este código al vendedor cuando completes
                                el servicio
                            </Text>
                        </View>
                    </>
                )}

                {isOwner && booking.status === 'confirmed' && (
                    <>
                        <Text style={globalStyles.subtitle}>
                            Verificar Servicio Completado
                        </Text>
                        <Text style={styles.instructionText}>
                            Pide al cliente su código de 4 dígitos para
                            confirmar que el servicio fue completado
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="código"
                            keyboardType="numeric"
                            maxLength={4}
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                        />

                        <Pressable
                            style={styles.submitButton}
                            onPress={handleVerifyCode}
                            disabled={verificationCode.length !== 4}
                        >
                            <Text style={styles.submitButtonText}>
                                Verificar Código
                            </Text>
                        </Pressable>
                    </>
                )}

                {!isOwner && (
                    <>
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
                                      ? 'Confirmada - Muestra tu código al completar el servicio'
                                      : booking.status === 'completed'
                                        ? '¡Servicio completado! No olvides calificar'
                                        : 'Estado: ' +
                                          getStatusText(booking.status)}
                            </Text>
                        </View>
                    </>
                )}

                <Pressable
                    onPress={handleChatPress}
                    style={globalStyles.button}
                >
                    <Text style={[{ color: 'white' }]}>Ir al chat</Text>
                </Pressable>

                <Pressable
                    onPress={() =>
                        router.push('report-feedback', {
                            serviceId: booking.service_id,
                        })
                    }
                    style={[globalStyles.button, { marginTop: 16 }]}
                >
                    <Text style={[{ color: 'white' }]}>Reportar Feedback</Text>
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
    codeContainer: {
        backgroundColor: '#F0E6FF',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#6A4C93',
        borderStyle: 'dashed',
    },
    codeText: {
        color: '#6A4C93',
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: 8,
        fontFamily: 'monospace',
    },
    codeHint: {
        color: '#6A4C93',
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    instructionText: {
        color: '#555',
        fontSize: 14,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 12,
        fontSize: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#DDD',
        textAlign: 'center',
        letterSpacing: 8,
        fontFamily: 'monospace',
        fontWeight: 'bold',
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
