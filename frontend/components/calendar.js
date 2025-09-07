import { useState, useEffect } from 'react'
import { View, Platform } from 'react-native'
import DateTimePicker from 'react-native-ui-datepicker'

export function Calendar({ selected, onDateSelect }) {
    const [date, setDate] = useState(selected || new Date())

    // Actualizar fecha cuando cambie la prop selected
    useEffect(() => {
        if (selected) {
            setDate(selected)
        }
    }, [selected])

    const handleDateChange = ({ date: newDate }) => {
        setDate(newDate)
        if (onDateSelect && newDate) {
            onDateSelect(newDate)
        }
    }

    return (
        <View>
            <DateTimePicker
                mode="single"
                date={date}
                onChange={handleDateChange}
                locale="es"
                timePicker={false}
                maxDate={new Date()}
                minDate={new Date(1900, 0, 1)}
            />
        </View>
    )
}
