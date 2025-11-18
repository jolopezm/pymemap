import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import Screen from '../../components/screen'
import { getMyBookings } from '../../api/booking-service'
import { Toast } from 'toastify-react-native'
import { globalStyles } from '../../styles/global'

export default function MyBookings() {
    const router = useRouter()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchBookings()
    }, [])

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
                </View>
            </View>
        )
    }

    const pendingCount = bookings.filter(b => b.status === 'pending').length
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length

    return (
        <Screen>
            <View style={styles.container}>
                <Text style={globalStyles.title}>Mis Reservas</Text>

                {/* Resumen */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryNumber}>
                            {bookings.length}
                        </Text>
                        <Text style={styles.summaryLabel}>Total</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text
                            style={[styles.summaryNumber, { color: '#ffc107' }]}
                        >
                            {pendingCount}
                        </Text>
                        <Text style={styles.summaryLabel}>Pendientes</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text
                            style={[styles.summaryNumber, { color: '#28a745' }]}
                        >
                            {confirmedCount}
                        </Text>
                        <Text style={styles.summaryLabel}>Confirmadas</Text>
                    </View>
                </View>

                {/* Lista de reservas */}
                {loading && bookings.length === 0 ? (
                    <Text style={styles.loadingText}>Cargando reservas...</Text>
                ) : bookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📅</Text>
                        <Text style={styles.emptyText}>
                            No tienes reservas aún
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Busca un negocio y solicita un servicio
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
}
