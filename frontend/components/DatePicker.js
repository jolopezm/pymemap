import React, { useState } from 'react'
import { View, Text, Pressable, Platform } from 'react-native'

// Importar DateTimePicker solo en plataformas nativas
let DateTimePicker
if (Platform.OS !== 'web') {
    DateTimePicker = require('@react-native-community/datetimepicker').default
}

export default function DatePicker({
    value,
    onChange,
    placeholder = 'Seleccionar fecha',
    style,
    textStyle,
}) {
    const [showPicker, setShowPicker] = useState(false)
    const [selectedDate, setSelectedDate] = useState(
        value ? new Date(value) : new Date()
    )

    const onDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false)
        }

        if (date) {
            setSelectedDate(date)
            const formattedDate = date.toISOString().split('T')[0]
            onChange(formattedDate)
        }
    }

    const getDisplayDate = () => {
        if (value) {
            const date = new Date(value)
            return date.toLocaleDateString('es-ES')
        }
        return placeholder
    }

    if (Platform.OS === 'web') {
        return (
            <View style={style}>
                <input
                    type="date"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        height: '100%',
                        fontSize: 16,
                        padding: 10,
                        borderRadius: 5,
                        border: '1px solid #ccc',
                        backgroundColor: '#fff',
                        outline: 'none',
                        fontFamily: 'inherit',
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    min="1900-01-01"
                />
            </View>
        )
    }

    return (
        <View>
            <Pressable
                style={[
                    style,
                    {
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: 'row',
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 5,
                        paddingHorizontal: 10,
                    },
                ]}
                onPress={() => setShowPicker(true)}
            >
                <Text
                    style={[
                        textStyle,
                        {
                            color: value ? '#000' : '#999',
                            fontSize: 16,
                        },
                    ]}
                >
                    {getDisplayDate()}
                </Text>
                <Text style={{ fontSize: 18, color: '#666' }}>📅</Text>
            </Pressable>

            {showPicker && DateTimePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={selectedDate}
                    mode="date"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                />
            )}
        </View>
    )
}
