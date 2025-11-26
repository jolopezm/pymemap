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
import { globalStyles, colors } from '../styles/theme'
import {
    getAllMyBusinessBookings,
    getMyBookings,
    verifyBookingCode,
} from '../api/booking-service'
import { getBusiness } from '../api/business-service'
import { createNotification } from '../api/notifications-service'
import { getChatByParticipants, createChat } from '../api/chat-service'
import logger from '../utils/logger'
import { API_URL } from '../config/api'
import EWBbutton from '../components/EWBbutton'

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
    const [paymentMethod, setPaymentMethod] = React.useState(null) // 'mercadopago' | 'other'
    const [customPrice, setCustomPrice] = React.useState('')
    const [paymentUrl, setPaymentUrl] = React.useState(null)
    const [loadingPayment, setLoadingPayment] = React.useState(false)

    // const fictitiousPrice = 5000 // Removed fixed price

    React.useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            try {
                setLoading(true)

                const [businessBookings, clientBookings, businessData] =
                    await Promise.all([
                        getAllMyBusinessBookings().catch(() => []),
                        getMyBookings().catch(() => []),
                        getBusiness(),
                    ])

                if (!mounted) return

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

                    const foundBusiness = businessData.find(
                        b => (b.id || b._id) === foundBooking.business_id
                    )
                    setBusiness(foundBusiness)

                    const userId = user?.id || user?._id
                    setIsOwner(
                        foundBusiness && foundBusiness.owner_id === userId
                    )
                }
            } catch (error) {
                logger.error('Error fetching booking:', error)
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

            await sendNotificationToClient(
                'Servicio completado',
                `Tu servicio del ${booking.date} a las ${booking.start_time} ha sido completado. ¡No olvides calificar!`,
                true // Incluir acción de calificar
            )

            alert('✅ Código verificado - Servicio completado')
        } catch (error) {
            logger.error('Error verifying code:', error)
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
            logger.error('Error creating notification:', error)
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

        if (includeRateAction) {
            notificationData.reference.action = 'rate_business'
            notificationData.reference.actionLabel = 'Calificar'
        }
        try {
            await createNotification(notificationData)
        } catch (error) {
            logger.error('Error creating notification:', error)
        }
    }

    const handleCreatePayment = async () => {
        if (
            !customPrice ||
            isNaN(parseInt(customPrice)) ||
            parseInt(customPrice) <= 0
        ) {
            alert('Por favor ingresa un precio válido')
            return
        }

        try {
            setLoadingPayment(true)
            const bookingIdParam = booking?._id || booking?.id || bookingId
            const url = `${API_URL}/mercadopago/create_preference/${customPrice}${bookingIdParam ? `?booking_id=${bookingIdParam}` : ''}`

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await response.json()

            console.log('📦 RESPUESTA COMPLETA DE MERCADOPAGO:')
            console.log(JSON.stringify(data, null, 2))

            if (
                data.response &&
                (data.response.init_point || data.response.sandbox_init_point)
            ) {
                const paymentLink =
                    data.response.init_point || data.response.sandbox_init_point
                console.log('✅ URL de pago:', paymentLink)
                console.log('📋 Preference ID:', data.response.id)
                console.log(
                    '📌 External Reference (Booking ID):',
                    data.response.external_reference
                )
                setPaymentUrl(paymentLink)

                setTimeout(() => {
                    alert(
                        'Después de completar tu pago, cierra el navegador y regresa a la app. Serás redirigido automáticamente al home.'
                    )
                }, 1000)
            } else {
                console.error(
                    '❌ Error: No se encontró init_point en la respuesta'
                )
                console.log('Respuesta recibida:', data)
                alert('Error al crear la preferencia de pago')
            }
        } catch (error) {
            console.error('❌ ERROR al crear preferencia:', error)
            logger.error('Error creating payment preference:', error)
            alert('Error al conectar con MercadoPago')
        } finally {
            setLoadingPayment(false)
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

            let chat = await getChatByParticipants(currentUserId, otherUserId)

            if (!chat) {
                const chatData = {
                    participants: [currentUserId, otherUserId],
                }
                chat = await createChat(chatData)
            }

            const chatId = chat._id || chat.id
            router.push(`/chat-view?chatId=${chatId}`)
        } catch (error) {
            logger.error('❌ Error al abrir chat:', error)
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
                {!isOwner && booking.status === 'confirmed' && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={globalStyles.subtitle}>
                            Método de Pago
                        </Text>
                        <Text style={styles.selectionLabel}>Selecciona:</Text>

                        <View style={styles.paymentMethodContainer}>
                            <Pressable
                                style={[
                                    styles.methodOption,
                                    paymentMethod === 'mercadopago' &&
                                        styles.methodOptionSelected,
                                ]}
                                onPress={() => setPaymentMethod('mercadopago')}
                            >
                                <Ionicons
                                    name="card-outline"
                                    size={24}
                                    color={
                                        paymentMethod === 'mercadopago'
                                            ? '#6A4C93'
                                            : '#666'
                                    }
                                />
                                <Text
                                    style={[
                                        styles.methodText,
                                        paymentMethod === 'mercadopago' &&
                                            styles.methodTextSelected,
                                    ]}
                                >
                                    MercadoPago
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.methodOption,
                                    paymentMethod === 'other' &&
                                        styles.methodOptionSelected,
                                ]}
                                onPress={() => setPaymentMethod('other')}
                            >
                                <Ionicons
                                    name="cash-outline"
                                    size={24}
                                    color={
                                        paymentMethod === 'other'
                                            ? '#6A4C93'
                                            : '#666'
                                    }
                                />
                                <Text
                                    style={[
                                        styles.methodText,
                                        paymentMethod === 'other' &&
                                            styles.methodTextSelected,
                                    ]}
                                >
                                    Otro Método
                                </Text>
                            </Pressable>
                        </View>

                        {paymentMethod === 'mercadopago' && (
                            <View style={styles.paymentSection}>
                                <Text style={styles.label}>
                                    Ingresa el monto a pagar:
                                </Text>
                                <View style={styles.priceInputContainer}>
                                    <Text style={styles.currencyPrefix}>$</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        value={customPrice.to}
                                        onChangeText={setCustomPrice}
                                    />
                                    <Text style={styles.currencySuffix}>
                                        CLP
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={handleCreatePayment}
                                    style={[
                                        styles.paymentButton,
                                        loadingPayment && { opacity: 0.5 },
                                    ]}
                                    disabled={loadingPayment}
                                >
                                    <Ionicons
                                        name="card"
                                        size={20}
                                        color="#fff"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.paymentButtonText}>
                                        {loadingPayment
                                            ? 'Creando pago...'
                                            : 'Pagar con MercadoPago'}
                                    </Text>
                                </Pressable>

                                {paymentUrl && (
                                    <View style={{ marginTop: 12 }}>
                                        <EWBbutton url={paymentUrl} />
                                    </View>
                                )}
                            </View>
                        )}

                        {paymentMethod === 'other' && (
                            <View style={styles.codeSection}>
                                <Text style={globalStyles.subtitle}>
                                    Tu Código de Verificación
                                </Text>
                                <View style={styles.codeContainer}>
                                    <Text style={styles.codeText}>
                                        {booking.requested_price}
                                    </Text>
                                    <Text style={styles.codeHint}>
                                        Muestra este código al vendedor cuando
                                        completes el servicio
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                <Pressable
                    onPress={handleChatPress}
                    style={globalStyles.button}
                >
                    <Text style={[{ color: 'white' }]}>Ir al chat</Text>
                </Pressable>

                <Pressable
                    onPress={() =>
                        router.push({
                            pathname: '/report',
                            params: {
                                bookingId: bookingId,
                                businessId: business?.id || business?._id,
                                businessName: business?.name || 'Negocio',
                                serviceDescription:
                                    booking?.service_description || '',
                            },
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
    priceContainer: {
        backgroundColor: '#F0E6FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#6A4C93',
    },
    priceText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#6A4C93',
        marginRight: 8,
    },
    priceLabel: {
        fontSize: 18,
        color: '#6A4C93',
        fontWeight: '600',
    },
    paymentButton: {
        backgroundColor: '#009EE3',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    paymentButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentMethodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    methodOption: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    methodOptionSelected: {
        backgroundColor: '#F0E6FF',
        borderColor: '#6A4C93',
        borderWidth: 2,
    },
    methodText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    methodTextSelected: {
        color: '#6A4C93',
        fontWeight: 'bold',
    },
    paymentSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#eee',
        marginTop: 8,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
        fontWeight: '500',
    },
    selectionLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        marginLeft: 4,
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 60,
    },
    priceInput: {
        flex: 1,
        textAlign: 'right',
        fontSize: 18,
        color: '#000',
        paddingHorizontal: 0,
    },
    currencyPrefix: {
        fontSize: 18,
        color: '#444',
        marginRight: 6,
    },
    currencySuffix: {
        fontSize: 16,
        color: '#555',
        marginLeft: 6,
    },
    codeSection: {
        marginTop: 8,
    },
})
