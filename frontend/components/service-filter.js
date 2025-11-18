import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { colors } from '../styles/global'

function ServiceFilter({ onFilterChange, services }) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState('all')

    // Contar servicios por estado
    const pendingCount = services.filter(
        s => s.state === 'pending' || s.state === 'payment_requested'
    ).length
    const inProgressCount = services.filter(
        s => s.state === 'in progress'
    ).length
    const completedCount = services.filter(s => s.state === 'completed').length

    const [items, setItems] = React.useState([
        { label: 'Todos los servicios', value: 'all' },
        { label: `Pendientes (${pendingCount})`, value: 'pending' },
        { label: `En Progreso (${inProgressCount})`, value: 'in progress' },
        { label: `Completados (${completedCount})`, value: 'completed' },
    ])

    // Actualizar las etiquetas cuando cambien los contadores
    React.useEffect(() => {
        setItems([
            { label: 'Todos los servicios', value: 'all' },
            { label: `Pendientes (${pendingCount})`, value: 'pending' },
            { label: `En Progreso (${inProgressCount})`, value: 'in progress' },
            { label: `Completados (${completedCount})`, value: 'completed' },
        ])
    }, [pendingCount, inProgressCount, completedCount])

    const handleValueChange = newValue => {
        setValue(newValue)
        onFilterChange(newValue)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Filtrar por estado:</Text>
            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                onChangeValue={handleValueChange}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholder="Selecciona un estado"
                listMode="SCROLLVIEW"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: colors.white,
        zIndex: 1000,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: colors.textSecondary,
    },
    dropdown: {
        borderColor: colors.gray,
        borderRadius: 8,
        minHeight: 45,
    },
    dropdownContainer: {
        borderColor: colors.gray,
        borderRadius: 8,
    },
})

export default ServiceFilter
