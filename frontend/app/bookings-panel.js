import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Pressable,
    FlatList,
    ScrollView,
    RefreshControl,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Screen from '../components/screen'
import {
    getBusinessBookings,
    confirmBooking,
    rejectBooking,
} from '../api/booking-service'
import { createNotification } from '../api/notifications-service'
import { Toast } from 'toastify-react-native'
import { globalStyles } from '../styles/global'

export default function BookingsPanel() {
    const { businessId, businessName } = useLocalSearchParams()
    const router = useRouter()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchBookings()
    }, [businessId])

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const data = await getBusinessBookings(businessId)
            // Ordenar por fecha y estado (pending primero)
            const sorted = data.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1
                if (a.status !== 'pending' && b.status === 'pending') return 1
                return new Date(b.date) - new Date(a.date)
            })
            setBookings(sorted)
        } catch (error) {
            console.error('Error fetching bookings:', error)
            Toast.error('Error al cargar reservas')
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchBookings()
        setRefreshing(false)
    }

    const handleConfirm = async bookingId => {
        try {
            const booking = bookings.find(b => (b._id || b.id) === bookingId)

            console.log('✅ Confirming booking:', bookingId)
            await confirmBooking(bookingId)

            // Enviar notificación al cliente
            if (booking?.client_id) {
                try {
                    const notifPayload = {
                        user_id: booking.client_id,
                        title: '✅ Reserva confirmada',
                        message: `Tu reserva para el ${booking.date} a las ${booking.start_time} ha sido confirmada`,
                        type: 'booking_confirmed',
                        related_id: bookingId,
                        read: false,
                    }

                    console.log(
                        '📤 Sending confirmation notification:',
                        notifPayload
                    )
                    await createNotification(notifPayload)
                    console.log('✅ Notification sent to client')
                } catch (notifError) {
                    console.error('⚠️ Error sending notification:', notifError)
                    console.error(
                        '⚠️ Error details:',
                        notifError.response?.data
                    )
                }
            } else {
                console.warn('⚠️ No client_id found in booking')
            }

            Toast.success('Reserva confirmada')
            fetchBookings()
        } catch (error) {
            console.error('❌ Error confirming booking:', error)
            Toast.error('Error al confirmar reserva')
        }
    }

    const handleReject = async bookingId => {
        try {
            const booking = bookings.find(b => (b._id || b.id) === bookingId)

            console.log('❌ Rejecting booking:', bookingId)
            await rejectBooking(bookingId)

            // Enviar notificación al cliente
            if (booking?.client_id) {
                try {
                    const notifPayload = {
                        user_id: booking.client_id,
                        title: '❌ Reserva rechazada',
                        message: `Tu reserva para el ${booking.date} a las ${booking.start_time} fue rechazada. Intenta otra fecha u horario.`,
                        type: 'booking_rejected',
                        related_id: bookingId,
                        read: false,
                    }

                    console.log(
                        '📤 Sending rejection notification:',
                        notifPayload
                    )
                    await createNotification(notifPayload)
                    console.log('✅ Notification sent to client')
                } catch (notifError) {
                    console.error('⚠️ Error sending notification:', notifError)
                    console.error(
                        '⚠️ Error details:',
                        notifError.response?.data
                    )
                }
            } else {
                console.warn('⚠️ No client_id found in booking')
            }

            Toast.success('Reserva rechazada')
            fetchBookings()
        } catch (error) {
            console.error('❌ Error rejecting booking:', error)
            Toast.error('Error al rechazar reserva')
        }
    }

    const getStatusBadge = status => {
        const badges = {
            pending: {
                text: '⏳ Pendiente',
                color: '#ffc107',
                textColor: '#000',
            },
            confirmed: {
                text: '✅ Confirmada',
                color: '#28a745',
                textColor: '#fff',
            },
            cancelled: {
                text: '❌ Cancelada',
                color: '#dc3545',
                textColor: '#fff',
            },
        }
        return badges[status] || badges.pending
    }

    const renderBookingCard = ({ item }) => {
        const badge = getStatusBadge(item.status)

        return (
            <View style={styles.card}>
                {/* Badge de estado */}
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: badge.color },
                    ]}
                >
                    <Text
                        style={[styles.statusText, { color: badge.textColor }]}
                    >
                        {badge.text}
                    </Text>
                </View>

                {/* Información de la reserva */}
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                        Cliente ID: {item.client_id}
                    </Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.icon}>📅</Text>
                        <Text style={styles.infoText}>{item.date}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.icon}>🕐</Text>
                        <Text style={styles.infoText}>
                            Hora de inicio: {item.start_time}
                        </Text>
                    </View>

                    {item.created_at && (
                        <View style={styles.infoRow}>
                            <Text style={styles.icon}>📝</Text>
                            <Text style={styles.infoTextSmall}>
                                Solicitado:{' '}
                                {new Date(item.created_at).toLocaleDateString(
                                    'es-ES'
                                )}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Botones de acción */}
                {item.status === 'pending' && (
                    <View style={styles.actions}>
                        <Pressable
                            style={[styles.actionButton, styles.confirmButton]}
                            onPress={() => handleConfirm(item._id)}
                        >
                            <Text style={styles.buttonText}>✅ Confirmar</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleReject(item._id)}
                        >
                            <Text style={styles.buttonText}>❌ Rechazar</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        )
    }

    const pendingCount = bookings.filter(b => b.status === 'pending').length

    return (
        <Screen>
            <View style={styles.container}>
                <Text style={globalStyles.title}>Panel de Reservas</Text>
                <Text style={styles.subtitle}>{businessName}</Text>

                {/* Resumen */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryNumber}>
                            {bookings.length}
                        </Text>
                        <Text style={styles.summaryLabel}>Total</Text>
                    </View>
                    <View
                        style={[
                            styles.summaryCard,
                            styles.summaryCardHighlight,
                        ]}
                    >
                        <Text
                            style={[styles.summaryNumber, { color: '#ffc107' }]}
                        >
                            {pendingCount}
                        </Text>
                        <Text style={styles.summaryLabel}>Pendientes</Text>
                    </View>
                </View>

                {/* Lista de reservas */}
                {loading && bookings.length === 0 ? (
                    <Text style={styles.loadingText}>Cargando reservas...</Text>
                ) : bookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyText}>
                            No hay reservas todavía
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Las solicitudes aparecerán aquí cuando los clientes
                            las envíen
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={bookings}
                        renderItem={renderBookingCard}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                    />
                )}
            </View>
        </Screen>
    )
}

const styles = {
    container: {
        flex: 1,
        padding: 16,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    summaryContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    summaryCardHighlight: {
        borderWidth: 2,
        borderColor: '#ffc107',
    },
    summaryNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    statusBadge: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 16,
        marginRight: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
    },
    infoTextSmall: {
        fontSize: 12,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#28a745',
        borderBottomLeftRadius: 12,
    },
    rejectButton: {
        backgroundColor: '#dc3545',
        borderBottomRightRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 40,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
}
