import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { getAvailableSlots } from '../api/booking-service'
import { globalStyles, colors } from '../styles/theme'
import logger from '../utils/logger'

export function TimeSlotPicker({ businessId, date, onSlotSelect }) {
    const [slots, setSlots] = useState([])
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (businessId && date) {
            fetchSlots()
        } else {
            setLoading(false)
        }
    }, [businessId, date])

    const fetchSlots = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAvailableSlots(businessId, date)
            setSlots(data || [])
        } catch (error) {
            logger.error('Error fetching slots:', error)
            if (error.response?.status === 404) {
                setError('No hay horarios configurados para esta fecha')
            } else {
                setError('Error al cargar horarios')
            }
            setSlots([])
        } finally {
            setLoading(false)
        }
    }

    const handleSlotPress = slot => {
        if (slot.is_available) {
            setSelectedSlot(slot)
            if (onSlotSelect) {
                onSlotSelect(slot)
            }
        }
    }

    if (loading) {
        return (
            <Text style={{ textAlign: 'center', padding: 20 }}>
                Cargando horarios...
            </Text>
        )
    }

    if (error) {
        return (
            <View
                style={{
                    padding: 20,
                    backgroundColor: '#fff3cd',
                    borderRadius: 8,
                    marginVertical: 10,
                }}
            >
                <Text style={{ color: '#856404', textAlign: 'center' }}>
                    ⚠️ {error}
                </Text>
                <Text
                    style={{
                        color: '#856404',
                        textAlign: 'center',
                        marginTop: 10,
                        fontSize: 12,
                    }}
                >
                    El dueño del negocio debe configurar horarios para esta
                    fecha.
                </Text>
            </View>
        )
    }

    if (slots.length === 0) {
        return (
            <Text style={{ textAlign: 'center', padding: 20 }}>
                No hay horarios disponibles para esta fecha
            </Text>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={globalStyles.title}>Selecciona un horario</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.slotsContainer}>
                    {slots.map((slot, index) => (
                        <Pressable
                            key={index}
                            style={[
                                styles.slot,
                                !slot.is_available && styles.slotDisabled,
                                selectedSlot === slot && styles.slotSelected,
                            ]}
                            onPress={() => handleSlotPress(slot)}
                            disabled={!slot.is_available}
                        >
                            <Text
                                style={[
                                    styles.slotText,
                                    !slot.is_available &&
                                        styles.slotTextDisabled,
                                    selectedSlot === slot &&
                                        styles.slotTextSelected,
                                ]}
                            >
                                {slot.start_time}
                            </Text>
                            <Text
                                style={[
                                    styles.slotSubtext,
                                    !slot.is_available &&
                                        styles.slotTextDisabled,
                                    selectedSlot === slot &&
                                        styles.slotTextSelected,
                                ]}
                            >
                                a {slot.end_time}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    slotsContainer: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 10,
    },
    slot: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#4dff88',
        borderWidth: 2,
        borderColor: '#4dff88',
        minWidth: 100,
        alignItems: 'center',
    },
    slotDisabled: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ccc',
    },
    slotSelected: {
        backgroundColor: '#2d3238ff',
        borderColor: '#2d3238ff',
    },
    slotText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    slotSubtext: {
        fontSize: 12,
        color: '#666',
    },
    slotTextDisabled: {
        color: '#999',
    },
    slotTextSelected: {
        color: '#fff',
    },
})
