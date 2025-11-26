import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import DateTimePicker from 'react-native-ui-datepicker'
import { getBusinessAvailability } from '../api/booking-service'
import logger from '../utils/logger'

/**
 * Calendario específico para reservas de servicios
 * Muestra solo los días disponibles configurados por el vendedor
 */
export function BookingCalendar({ businessId, onDateSelect, selectedDate }) {
    const [availableDates, setAvailableDates] = useState([])
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [internalSelected, setInternalSelected] = useState(undefined)

    useEffect(() => {
        if (selectedDate) {
            setInternalSelected(new Date(selectedDate))
        }
    }, [selectedDate])

    useEffect(() => {
        if (businessId) {
            fetchAvailability()
        }
    }, [businessId, currentMonth])

    const fetchAvailability = async () => {
        try {
            const year = currentMonth.getFullYear()
            const month = currentMonth.getMonth() + 1
            const data = await getBusinessAvailability(businessId, year, month)

            // Extraer fechas disponibles
            const dates = data.map(item => item.date)
            setAvailableDates(dates)
        } catch (error) {
            logger.error('Error fetching availability:', error)
            setAvailableDates([])
        }
    }

    const isDateAvailable = date => {
        // Verificar fechas disponibles del negocio
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        const available = availableDates.includes(dateStr)

        return available
    }

    return (
        <View style={styles.container}>
            <DateTimePicker
                key={availableDates.length} // Forzar re-render cuando cambien las fechas disponibles
                mode="single"
                date={internalSelected || new Date()}
                onChange={({ date }) => {
                    if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(
                            2,
                            '0'
                        )
                        const day = String(date.getDate()).padStart(2, '0')
                        const dateStr = `${year}-${month}-${day}`

                        const available = isDateAvailable(date)

                        if (available) {
                            setInternalSelected(date)
                            if (onDateSelect) {
                                onDateSelect(dateStr)
                            }
                        }
                    }
                }}
                onMonthChange={month => {
                    if (month) {
                        setCurrentMonth(month)
                    }
                }}
                locale="es"
                minDate={new Date()}
                customDayNames={{
                    dayTextStyle: date => {
                        if (!isDateAvailable(date)) {
                            return { opacity: 0.3 }
                        }
                        return {}
                    },
                }}
                selectedItemColor="#4dff88"
                styles={{
                    day: date => ({
                        margin: 2,
                        borderRadius: 5,
                        backgroundColor: isDateAvailable(date)
                            ? '#4dff88'
                            : '#f0f0f0',
                    }),
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
            <Text style={styles.legend}>🟢 = Días disponibles</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 20,
    },
    legend: {
        marginTop: 10,
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
})
