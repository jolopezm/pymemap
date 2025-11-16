import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Screen from '../components/screen'
import { Calendar } from '../components/calendar'
import { TimeSlotPicker } from '../components/time-slot-picker'
import { createBooking } from '../api/booking-service'
import { Toast } from 'toastify-react-native'
import { globalStyles } from '../styles/global'

export default function BookService() {
    const { businessId, businessName } = useLocalSearchParams()
    const router = useRouter()
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedSlot) {
            Toast.error('Por favor selecciona fecha y horario')
            return
        }

        setLoading(true)
        try {
            await createBooking({
                business_id: businessId,
                date: selectedDate,
                start_time: selectedSlot.start_time,
                end_time: selectedSlot.end_time,
            })

            Toast.success('Solicitud de reserva enviada')
            router.push('/home')
        } catch (error) {
            Toast.error('Error al crear reserva')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Screen>
            <ScrollView>
                <Text style={globalStyles.title}>
                    Reservar servicio en {businessName}
                </Text>

                <Calendar
                    businessId={businessId}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                />

                {selectedDate && (
                    <>
                        <Text style={styles.dateSelected}>
                            Fecha seleccionada: {selectedDate}
                        </Text>

                        <TimeSlotPicker
                            businessId={businessId}
                            date={selectedDate}
                            onSlotSelect={setSelectedSlot}
                        />
                    </>
                )}

                {selectedSlot && (
                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>
                            Resumen de reserva
                        </Text>
                        <Text>📅 Fecha: {selectedDate}</Text>
                        <Text>
                            🕐 Horario: {selectedSlot.start_time} -{' '}
                            {selectedSlot.end_time}
                        </Text>
                    </View>
                )}

                <Pressable
                    style={[
                        globalStyles.button,
                        (!selectedDate || !selectedSlot || loading) &&
                            globalStyles.button.disabled,
                    ]}
                    onPress={handleConfirmBooking}
                    disabled={!selectedDate || !selectedSlot || loading}
                >
                    <Text style={{ color: '#fff' }}>
                        {loading ? 'Enviando...' : 'Confirmar Reserva'}
                    </Text>
                </Pressable>
            </ScrollView>
        </Screen>
    )
}

const styles = {
    dateSelected: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 10,
        textAlign: 'center',
    },
    summary: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginVertical: 20,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
}
