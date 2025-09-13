import { useState, useEffect } from 'react'
import DateTimePicker from 'react-native-ui-datepicker'

export function Calendar({ selected, onDateSelect }) {
    let today = new Date()
    const [internalSelected, setInternalSelected] = useState(undefined)

    useEffect(() => {
        if (selected) {
            const [day, month, year] = selected.split('/').map(Number)
            const dateObj = new Date(year, month - 1, day)
            setInternalSelected(dateObj)
        } else {
            setInternalSelected(undefined)
        }
    }, [selected])

    return (
        <DateTimePicker
            mode="single"
            date={internalSelected}
            onChange={({ date }) => {
                setInternalSelected(date)
                if (onDateSelect) onDateSelect(date)
            }}
            locale="es"
            maxDate={today}
            showOutsideDays={false}
            styles={{
                month_selector: {
                    padding: 10,
                    borderRadius: 5,
                    backgroundColor: '#f0f0f0',
                },
                year_selector: {
                    padding: 10,
                    borderRadius: 5,
                    backgroundColor: '#f0f0f0',
                },
                day: {
                    margin: 2,
                    borderRadius: 5,
                    backgroundColor: '#f0f0f0',
                },
                month: {
                    backgroundColor: '#e0e0e0',
                    borderRadius: 5,
                },
                year: {
                    backgroundColor: '#e0e0e0',
                    borderRadius: 5,
                },
                today: {
                    borderColor: 'black',
                    borderWidth: 1,
                },
                selected: {
                    backgroundColor: 'black',
                },
                selected_label: {
                    color: 'white',
                },
                disabled: {
                    opacity: 0.5,
                },
                button_next: {
                    backgroundColor: '#e0e0e0',
                },
                button_prev: {
                    backgroundColor: '#e0e0e0',
                },
            }}
        />
    )
}
