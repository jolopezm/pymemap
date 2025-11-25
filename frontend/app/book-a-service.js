import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Screen from '../components/screen'
import DateTimePicker from 'react-native-ui-datepicker'
import RNDateTimePicker from '@react-native-community/datetimepicker'
import { createBooking } from '../api/booking-service'
import { createNotification } from '../api/notifications-service'
import { getBusiness } from '../api/business-service'
import { Toast } from 'toastify-react-native'
import { globalStyles, colors } from '../styles/theme'
import { useAuth } from '../context/auth-context'
import logger from '../utils/logger'

export default function BookService() {
    const { businessId, businessName } = useLocalSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState(new Date())
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [loading, setLoading] = useState(false)

    const formatDate = date => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const formatTime = date => {
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const handleTimeChange = (event, time) => {
        setShowTimePicker(Platform.OS === 'ios')
        if (time) {
            setSelectedTime(time)
        }
    }

    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedTime) {
            Toast.error('Por favor selecciona fecha y hora')
            return
        }

        if (!user?._id) {
            Toast.error('Debes iniciar sesión')
            return
        }

        setLoading(true)
        try {
            const dateStr = formatDate(selectedDate)
            const timeStr = formatTime(selectedTime)

            // Calcular hora de fin (1 hora después por defecto)
            const endTime = new Date(selectedTime)
            endTime.setHours(endTime.getHours() + 1)
            const endTimeStr = formatTime(endTime)

            // 1. Crear la reserva
            const booking = await createBooking({
                business_id: businessId,
                date: dateStr,
                start_time: timeStr,
                end_time: endTimeStr,
            })

            // 2. Obtener el negocio para tener el owner_id
            const businessData = await getBusiness(businessId)

            if (!businessData?.owner_id) {
                logger.warn('⚠️ No se encontró owner_id en el negocio')
                Toast.success(
                    'Reserva creada (pero no se pudo notificar al vendedor)'
                )
                router.push('/my-bookings')
                return
            }

            // 3. Crear notificación para el vendedor
            try {
                const notifPayload = {
                    targetUserId: businessData.owner_id,
                    message: `${user.name || user.email} solicitó una reserva en ${businessName || businessData.name} para el ${dateStr} a las ${timeStr}`,
                    type: 'booking_request',
                    date: new Date().toISOString(),
                    reference: {
                        booking_id: booking._id || booking.id,
                        business_name: businessName || businessData.name,
                        requested_date: dateStr,
                        requested_time: timeStr,
                    },
                }

                await createNotification(notifPayload)
                Toast.success(
                    '¡Solicitud enviada! El vendedor la revisará pronto'
                )
            } catch (notifError) {
                logger.error('⚠️ Error sending notification:', notifError)
                logger.error('⚠️ Error details:', notifError.response?.data)
                Toast.success(
                    'Reserva creada (pero hubo un problema al notificar)'
                )
            }

            router.push('/my-bookings')
        } catch (error) {
            logger.error('❌ Error completo:', error)
            logger.error('❌ Error response:', error.response?.data)
            Toast.error(
                error.response?.data?.detail || 'Error al enviar solicitud'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Screen>
            <ScrollView style={styles.container}>
                <Text style={globalStyles.title}>
                    Solicitar servicio en {businessName}
                </Text>

                <Text style={styles.subtitle}>
                    Selecciona la fecha y hora de inicio. El vendedor revisará
                    tu solicitud y te confirmará.
                </Text>

                {/* Selector de fecha */}
                <View style={styles.section}>
                    <Text style={styles.label}>📅 Fecha del servicio</Text>
                    <DateTimePicker
                        mode="single"
                        date={selectedDate}
                        onChange={({ date }) => {
                            if (date) setSelectedDate(date)
                        }}
                        locale="es"
                        minDate={new Date()}
                        selectedItemColor="#4dff88"
                        styles={{
                            day: {
                                margin: 2,
                                borderRadius: 5,
                            },
                            selected: {
                                backgroundColor: '#2d3238ff',
                            },
                            selected_label: {
                                color: 'white',
                            },
                            today: {
                                borderColor: 'black',
                                borderWidth: 1,
                            },
                        }}
                    />
                </View>

                {/* Selector de hora */}
                <View style={styles.section}>
                    <Text style={styles.label}>🕐 Hora de inicio</Text>

                    <Pressable
                        style={styles.timeButton}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={styles.timeButtonText}>
                            {formatTime(selectedTime)}
                        </Text>
                        <Text style={styles.timeButtonHint}>
                            Toca para cambiar
                        </Text>
                    </Pressable>

                    {showTimePicker && (
                        <RNDateTimePicker
                            value={selectedTime}
                            mode="time"
                            is24Hour={true}
                            display={
                                Platform.OS === 'ios' ? 'spinner' : 'default'
                            }
                            onChange={handleTimeChange}
                        />
                    )}

                    <Text style={styles.hint}>
                        💡 La duración del servicio se acordará con el vendedor
                    </Text>
                </View>

                {/* Resumen */}
                <View style={styles.summary}>
                    <Text style={styles.summaryTitle}>
                        📋 Resumen de solicitud
                    </Text>
                    <Text style={styles.summaryText}>
                        📅 Fecha: {formatDate(selectedDate)}
                    </Text>
                    <Text style={styles.summaryText}>
                        🕐 Hora de inicio: {formatTime(selectedTime)}
                    </Text>
                    <Text style={styles.summaryNote}>
                        ⏳ El vendedor revisará tu solicitud y te confirmará si
                        está disponible en este horario.
                    </Text>
                </View>

                {/* Botón de confirmar */}
                <Pressable
                    style={[
                        globalStyles.button,
                        loading && styles.buttonDisabled,
                    ]}
                    onPress={handleConfirmBooking}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Enviando...' : '✉️ Enviar solicitud'}
                    </Text>
                </Pressable>
            </ScrollView>
        </Screen>
    )
}

const styles = {
    container: {
        padding: 16,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    timeButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#4dff88',
    },
    timeButtonText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
    },
    timeButtonHint: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    hint: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    summary: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#4dff88',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    summaryText: {
        fontSize: 14,
        marginBottom: 6,
        color: '#333',
    },
    summaryNote: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        fontStyle: 'italic',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
}
