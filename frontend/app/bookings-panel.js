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
import DropDownPicker from 'react-native-dropdown-picker'
import Screen from '../components/screen'
import {
    getBusinessBookings,
    getAllMyBusinessBookings,
    confirmBooking,
    rejectBooking,
} from '../api/booking-service'
import { createNotification } from '../api/notifications-service'
import { Toast } from 'toastify-react-native'
import { globalStyles, colors, spacing, borderRadius, shadows } from '../styles/theme'
import logger from '../utils/logger'

export default function BookingsPanel() {
    const { businessId, businessName } = useLocalSearchParams()
    const router = useRouter()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [filterStatus, setFilterStatus] = useState('all') // 'all' = mostrar todos
    const [dropdownOpen, setDropdownOpen] = useState(false)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const data = await getAllMyBusinessBookings()
            // Ordenar por fecha y estado (pending primero)
            const sorted = data.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1
                if (a.status !== 'pending' && b.status === 'pending') return 1
                return new Date(b.date) - new Date(a.date)
            })
            setBookings(sorted)
        } catch (error) {
            logger.error('Error fetching bookings:', error)
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

            await confirmBooking(bookingId)

            // Enviar notificación al cliente
            if (booking?.client_id) {
                try {
                    const notifPayload = {
                        targetUserId: booking.client_id,
                        message: `Tu reserva para el ${booking.date} a las ${booking.start_time} ha sido confirmada`,
                        type: 'booking_confirmed',
                        date: new Date().toISOString(),
                        reference: {
                            booking_id: bookingId,
                            date: booking.date,
                            start_time: booking.start_time,
                        },
                    }

                    await createNotification(notifPayload)
                } catch (notifError) {
                    logger.error('⚠️ Error sending notification:', notifError)
                    logger.error(
                        '⚠️ Error details:',
                        notifError.response?.data
                    )
                }
            } else {
                logger.warn('⚠️ No client_id found in booking')
            }

            Toast.success('Reserva confirmada')
            fetchBookings()
        } catch (error) {
            logger.error('❌ Error confirming booking:', error)
            Toast.error('Error al confirmar reserva')
        }
    }

    const handleReject = async bookingId => {
        try {
            const booking = bookings.find(b => (b._id || b.id) === bookingId)
            await rejectBooking(bookingId)

            // Enviar notificación al cliente
            if (booking?.client_id) {
                try {
                    const notifPayload = {
                        targetUserId: booking.client_id,
                        message: `Tu reserva para el ${booking.date} a las ${booking.start_time} fue rechazada. Intenta otra fecha u horario.`,
                        type: 'booking_rejected',
                        date: new Date().toISOString(),
                        reference: {
                            booking_id: bookingId,
                            date: booking.date,
                            start_time: booking.start_time,
                        },
                    }

                    await createNotification(notifPayload)
                } catch (notifError) {
                    logger.error('⚠️ Error sending notification:', notifError)
                    logger.error(
                        '⚠️ Error details:',
                        notifError.response?.data
                    )
                }
            } else {
                logger.warn('⚠️ No client_id found in booking')
            }

            Toast.success('Reserva rechazada')
            fetchBookings()
        } catch (error) {
            logger.error('❌ Error rejecting booking:', error)
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
            completed: {
                text: '✅ Completada',
                color: '#6f42c1',
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
                        {item.business_name || 'Negocio'}
                    </Text>
                    <Text style={styles.clientInfo}>
                        Cliente: {item.client_id}
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

                {/* Botón para ver detalles siempre visible */}
                <View style={styles.detailSection}>
                    <Pressable
                        style={styles.detailButton}
                        onPress={() =>
                            router.push({
                                pathname: '/booking-detail',
                                params: { id: item._id },
                            })
                        }
                    >
                        <Text style={styles.detailButtonText}>
                            📋 Ver Detalle
                        </Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    const pendingCount = bookings.filter(b => b.status === 'pending').length
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
    const completedCount = bookings.filter(b => b.status === 'completed').length
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length

    const dropdownItems = [
        { label: `Todas (${bookings.length})`, value: 'all' },
        { label: `⏳ Pendientes (${pendingCount})`, value: 'pending' },
        { label: `✅ Confirmadas (${confirmedCount})`, value: 'confirmed' },
        { label: `✅ Completadas (${completedCount})`, value: 'completed' },
        { label: `❌ Canceladas (${cancelledCount})`, value: 'cancelled' },
    ]

    // Filtrar bookings según el estado seleccionado
    const filteredBookings =
        filterStatus === 'all'
            ? bookings
            : bookings.filter(b => b.status === filterStatus)

    return (
        <Screen>
            <View style={styles.container}>
                <Text style={styles.subtitle}>
                    Todas las reservas de tus negocios
                </Text>

                {/* Filtro con dropdown */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Filtrar por estado:</Text>
                    <DropDownPicker
                        open={dropdownOpen}
                        value={filterStatus}
                        items={dropdownItems}
                        setOpen={setDropdownOpen}
                        setValue={setFilterStatus}
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        placeholder="Selecciona un estado"
                        listMode="SCROLLVIEW"
                        zIndex={3000}
                        zIndexInverse={1000}
                    />
                </View>

                {/* Lista de reservas */}
                {loading && bookings.length === 0 ? (
                    <Text style={styles.loadingText}>Cargando reservas...</Text>
                ) : filteredBookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyText}>
                            {filterStatus !== 'all'
                                ? `No tienes reservas ${
                                      filterStatus === 'pending'
                                          ? 'pendientes'
                                          : filterStatus === 'confirmed'
                                            ? 'confirmadas'
                                            : filterStatus === 'completed'
                                              ? 'completadas'
                                              : 'canceladas'
                                  }`
                                : 'No tienes reservas aún'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {filterStatus !== 'all'
                                ? 'Selecciona "Todas" para ver todas las reservas'
                                : 'Aquí aparecerán todas las solicitudes de reserva de tus negocios'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredBookings}
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
    filterContainer: {
        marginBottom: 20,
        zIndex: 3000,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#666',
    },
    dropdown: {
        borderColor: '#ddd',
        borderRadius: 8,
        minHeight: 45,
    },
    dropdownContainer: {
        borderColor: '#ddd',
        borderRadius: 8,
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 16,
        shadowColor: '#9B59B6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
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
        marginBottom: 4,
        color: '#333',
    },
    clientInfo: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
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
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e74c3c',
        textAlign: 'center',
        marginTop: 40,
        marginBottom: 8,
    },
    errorSubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 40,
    },
    backButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'center',
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    detailSection: {
        flexDirection: 'row',
        gap: 8,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailButton: {
        flex: 1,
        backgroundColor: '#3498db',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    detailButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    paymentButton: {
        flex: 1,
        backgroundColor: '#f39c12',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    paymentButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
}
