import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Pressable,
    FlatList,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import Screen from '../components/screen'
import { Calendar } from '../components/calendar'
import {
    getBusinessBookings,
    confirmBooking,
    setBusinessAvailability,
    getBusinessAvailability,
} from '../api/booking-service'
import { Toast } from 'toastify-react-native'
import { globalStyles } from '../styles/global'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from 'react-native-ui-datepicker'

export default function ManageAvailability() {
    const { businessId } = useLocalSearchParams()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [showAddAvailability, setShowAddAvailability] = useState(false)
    const [selectedDate, setSelectedDate] = useState(undefined)
    const [timeSlots, setTimeSlots] = useState([])
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('18:00')
    const [currentMonth, setCurrentMonth] = useState(new Date())

    useEffect(() => {
        if (businessId) {
            fetchBookings()
        }
    }, [businessId])

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const data = await getBusinessBookings(businessId)
            setBookings(data || [])
        } catch (error) {
            console.error('Error fetching bookings:', error)
            Toast.error(
                'El código ha expirado. Por favor, solicita uno nuevo.',
                { duration: 3000 }
            )
        } finally {
            setLoading(false)
        }
    }

    const handleConfirm = async bookingId => {
        try {
            await confirmBooking(bookingId)
            Toast.success(
                'Correo verificado. Ahora puedes cambiar tu contraseña.',
                { duration: 3000 }
            )
            fetchBookings()
        } catch (error) {
            console.error('Error confirming booking:', error)
            Toast.error('Error al confirmar reserva', { duration: 3000 })
        }
    }

    const addTimeSlot = () => {
        if (!startTime || !endTime) {
            Alert.alert('Error', 'Ingresa horarios válidos')
            return
        }

        if (startTime >= endTime) {
            Alert.alert('Error', 'La hora de inicio debe ser menor a la de fin')
            return
        }

        const newSlot = {
            start_time: startTime,
            end_time: endTime,
            is_available: true,
        }

        setTimeSlots([...timeSlots, newSlot])
        setStartTime('09:00')
        setEndTime('18:00')
    }

    const removeTimeSlot = index => {
        const updatedSlots = timeSlots.filter((_, i) => i !== index)
        setTimeSlots(updatedSlots)
    }

    const saveAvailability = async () => {
        if (!selectedDate) {
            Alert.alert('Error', 'Selecciona una fecha')
            return
        }

        if (timeSlots.length === 0) {
            Alert.alert('Error', 'Agrega al menos un horario')
            return
        }

        try {
            const dateStr =
                typeof selectedDate === 'string'
                    ? selectedDate
                    : selectedDate.toISOString().split('T')[0]

            await setBusinessAvailability(businessId, {
                business_id: businessId,
                date: dateStr,
                time_slots: timeSlots,
                max_concurrent_bookings: 1,
            })

            Toast.success('Disponibilidad guardada', { duration: 3000 })

            setShowAddAvailability(false)
            setSelectedDate(undefined)
            setTimeSlots([])
        } catch (error) {
            console.error('Error saving availability:', error)
            Alert.alert('Error', 'No se pudo guardar la disponibilidad')
        }
    }

    const renderBooking = ({ item }) => (
        <View style={[globalStyles.card, { marginBottom: 12 }]}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                📅 {item.date}
            </Text>
            <Text style={{ color: '#555', marginBottom: 4 }}>
                🕐 {item.start_time} a {item.end_time}
            </Text>
            <Text style={{ color: '#666', marginBottom: 4 }}>
                Cliente ID: {item.client_id}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                }}
            >
                <Text style={{ fontWeight: '600', marginRight: 8 }}>
                    Estado:
                </Text>
                <Text
                    style={{
                        color:
                            item.status === 'confirmed'
                                ? '#4CAF50'
                                : item.status === 'pending'
                                  ? '#FF9800'
                                  : '#F44336',
                        fontWeight: '600',
                    }}
                >
                    {item.status === 'pending'
                        ? 'Pendiente'
                        : item.status === 'confirmed'
                          ? 'Confirmada'
                          : 'Cancelada'}
                </Text>
            </View>

            {item.status === 'pending' && (
                <Pressable
                    style={[
                        globalStyles.button,
                        {
                            marginTop: 10,
                            backgroundColor: '#4CAF50',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                    ]}
                    onPress={() => handleConfirm(item.id || item._id)}
                >
                    <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                        Confirmar Reserva
                    </Text>
                </Pressable>
            )}
        </View>
    )

    return (
        <Screen>
            <ScrollView>
                <Text style={globalStyles.title}>Gestión de Reservas</Text>

                {/* Botón para agregar disponibilidad */}
                <Pressable
                    style={[
                        globalStyles.button,
                        {
                            backgroundColor: '#9B59B6',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                        },
                    ]}
                    onPress={() => setShowAddAvailability(!showAddAvailability)}
                >
                    <Ionicons
                        name={
                            showAddAvailability ? 'close-circle' : 'add-circle'
                        }
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                        {showAddAvailability
                            ? 'Cancelar'
                            : 'Agregar Disponibilidad'}
                    </Text>
                </Pressable>

                {/* Formulario para agregar disponibilidad */}
                {showAddAvailability && (
                    <View
                        style={{
                            backgroundColor: '#F5F5F5',
                            padding: 16,
                            borderRadius: 8,
                            marginBottom: 20,
                        }}
                    >
                        <Text
                            style={[
                                globalStyles.subtitle,
                                { marginBottom: 12 },
                            ]}
                        >
                            Selecciona una fecha
                        </Text>

                        <DateTimePicker
                            mode="single"
                            date={selectedDate || new Date()}
                            onChange={({ date }) => {
                                if (date) {
                                    setSelectedDate(date)
                                }
                            }}
                            locale="es"
                            minDate={new Date()}
                            selectedItemColor="#9B59B6"
                        />

                        {selectedDate && (
                            <Text
                                style={{
                                    textAlign: 'center',
                                    marginTop: 10,
                                    fontWeight: '600',
                                }}
                            >
                                Fecha seleccionada:{' '}
                                {typeof selectedDate === 'string'
                                    ? selectedDate
                                    : selectedDate.toISOString().split('T')[0]}
                            </Text>
                        )}

                        <View
                            style={{
                                borderTopWidth: 1,
                                borderColor: '#DDD',
                                marginVertical: 16,
                            }}
                        />

                        <Text
                            style={[
                                globalStyles.subtitle,
                                { marginBottom: 12 },
                            ]}
                        >
                            Agregar horarios
                        </Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 12,
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: '#666',
                                        marginBottom: 4,
                                    }}
                                >
                                    Hora inicio
                                </Text>
                                <TextInput
                                    style={globalStyles.textField}
                                    placeholder="09:00"
                                    value={startTime}
                                    onChangeText={setStartTime}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: '#666',
                                        marginBottom: 4,
                                    }}
                                >
                                    Hora fin
                                </Text>
                                <TextInput
                                    style={globalStyles.textField}
                                    placeholder="18:00"
                                    value={endTime}
                                    onChangeText={setEndTime}
                                />
                            </View>
                        </View>

                        <Pressable
                            style={[
                                globalStyles.button,
                                {
                                    backgroundColor: '#2196F3',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                            ]}
                            onPress={addTimeSlot}
                        >
                            <Ionicons
                                name="time"
                                size={20}
                                color="#fff"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={{ color: '#fff', fontWeight: '600' }}>
                                Agregar Horario
                            </Text>
                        </Pressable>

                        {/* Lista de horarios agregados */}
                        {timeSlots.length > 0 && (
                            <View style={{ marginTop: 16 }}>
                                <Text
                                    style={{
                                        fontWeight: '600',
                                        marginBottom: 8,
                                    }}
                                >
                                    Horarios agregados:
                                </Text>
                                {timeSlots.map((slot, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: '#FFF',
                                            padding: 12,
                                            borderRadius: 8,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text>
                                            🕐 {slot.start_time} -{' '}
                                            {slot.end_time}
                                        </Text>
                                        <Pressable
                                            onPress={() =>
                                                removeTimeSlot(index)
                                            }
                                        >
                                            <Ionicons
                                                name="trash"
                                                size={20}
                                                color="#F44336"
                                            />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}

                        <Pressable
                            style={[
                                globalStyles.button,
                                {
                                    backgroundColor: '#4CAF50',
                                    marginTop: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                            ]}
                            onPress={saveAvailability}
                        >
                            <Ionicons
                                name="save"
                                size={20}
                                color="#fff"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={{ color: '#fff', fontWeight: '600' }}>
                                Guardar Disponibilidad
                            </Text>
                        </Pressable>
                    </View>
                )}

                {/* Lista de reservas */}
                <Text
                    style={[
                        globalStyles.subtitle,
                        { marginTop: 20, marginBottom: 12 },
                    ]}
                >
                    Reservas recibidas
                </Text>

                {loading ? (
                    <Text>Cargando...</Text>
                ) : bookings.length > 0 ? (
                    <FlatList
                        data={bookings}
                        renderItem={renderBooking}
                        keyExtractor={item => item.id || item._id}
                        scrollEnabled={false}
                    />
                ) : (
                    <Text style={{ color: '#666', textAlign: 'center' }}>
                        No hay reservas aún
                    </Text>
                )}
            </ScrollView>
        </Screen>
    )
}
