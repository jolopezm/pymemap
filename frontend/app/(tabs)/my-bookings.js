import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import DropDownPicker from 'react-native-dropdown-picker'
import Screen from '../../components/screen'
import { getMyBookings } from '../../api/booking-service'
import { Toast } from 'toastify-react-native'
import { globalStyles } from '../../styles/global'

export default function MyBookings() {
    const router = useRouter()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [filterStatus, setFilterStatus] = useState('all') // 'all' = mostrar todos
    const [dropdownOpen, setDropdownOpen] = useState(false)

    useEffect(() => {
        fetchBookings()
    }, [])

    // Refrescar cuando la pantalla recibe foco
    useFocusEffect(
        React.useCallback(() => {
            fetchBookings()
        }, [])
    )

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const data = await getMyBookings()
            // Ordenar por fecha (más reciente primero)
            const sorted = data.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            )
            setBookings(sorted)
        } catch (error) {
            console.error('Error fetching my bookings:', error)
            Toast.error('Error al cargar mis reservas')
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchBookings()
        setRefreshing(false)
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
            completed: {
                text: '✅ Completada',
                color: '#17a2b8',
                textColor: '#fff',
            },
            payment_requested: {
                text: '💳 Pago pendiente',
                color: '#fd7e14',
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
                        Negocio ID: {item.business_id}
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

                    {/* Mensaje según estado */}
                    {item.status === 'pending' && (
                        <View style={styles.messageBox}>
                            <Text style={styles.messageText}>
                                ⏳ Esperando confirmación del vendedor
                            </Text>
                        </View>
                    )}
                    {item.status === 'confirmed' && (
                        <View
                            style={[
                                styles.messageBox,
                                { backgroundColor: '#d4edda' },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    { color: '#155724' },
                                ]}
                            >
                                ✅ ¡Reserva confirmada! El vendedor te espera
                            </Text>
                        </View>
                    )}
                    {item.status === 'cancelled' && (
                        <View
                            style={[
                                styles.messageBox,
                                { backgroundColor: '#f8d7da' },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    { color: '#721c24' },
                                ]}
                            >
                                ❌ Esta reserva fue cancelada
                            </Text>
                        </View>
                    )}
                    {item.status === 'completed' && (
                        <View
                            style={[
                                styles.messageBox,
                                { backgroundColor: '#e7f3ff' },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    { color: '#0066cc' },
                                ]}
                            >
                                ✅ ¡Reserva completada! ¿Qué tal fue tu
                                experiencia?
                            </Text>
                        </View>
                    )}

                    {/* Botón para ver detalle */}
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

                        {/* Mostrar estado de pago si aplica */}
                        {item.status === 'payment_requested' && (
                            <Pressable
                                style={styles.payButton}
                                onPress={() =>
                                    router.push({
                                        pathname: '/booking-detail',
                                        params: { id: item._id },
                                    })
                                }
                            >
                                <Text style={styles.payButtonText}>
                                    💳 Pagar
                                </Text>
                            </Pressable>
                        )}

                        {/* Botón para calificar si está completada */}
                        {item.status === 'completed' && (
                            <Pressable
                                style={styles.rateButton}
                                onPress={() =>
                                    router.push({
                                        pathname: '/rate-business',
                                        params: {
                                            id: item.business_id,
                                            bookingId: item._id,
                                            businessName:
                                                item.business_name || 'Negocio',
                                        },
                                    })
                                }
                            >
                                <Text style={styles.rateButtonText}>
                                    ⭐ Calificar
                                </Text>
                            </Pressable>
                        )}
                    </View>
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
                <Text style={globalStyles.title}>Mis Reservas</Text>

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
                        <Text style={styles.emptyIcon}>📅</Text>
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
                                : 'Busca un negocio y solicita un servicio'}
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
    summaryContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    summaryCardActive: {
        backgroundColor: '#e0e7ff',
        borderWidth: 2,
        borderColor: '#6366f1',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    summaryNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    summaryLabel: {
        fontSize: 10,
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
    messageBox: {
        backgroundColor: '#fff3cd',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    messageText: {
        fontSize: 12,
        color: '#856404',
        textAlign: 'center',
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
    detailSection: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
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
    payButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    rateButton: {
        flex: 1,
        backgroundColor: '#FFD700',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    rateButtonText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '600',
    },
}
