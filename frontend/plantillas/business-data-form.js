import React from 'react'
import { Text, TextInput, Pressable } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { globalStyles } from '../styles/global'

export default function BusinessDataForm({
    name,
    setName,
    category,
    setCategory,
    description,
    setDescription,
    error,
    onNext,
}) {
    const [open, setOpen] = React.useState(false)
    const [items, setItems] = React.useState([
        { label: 'Comida', value: 'comida' },
        { label: 'Servicios', value: 'servicios' },
        { label: 'Retail', value: 'retail' },
        { label: 'Salud', value: 'salud' },
        { label: 'Belleza', value: 'belleza' },
        { label: 'Educación', value: 'educacion' },
        { label: 'Hogar', value: 'hogar' },
        { label: 'Otros', value: 'otros' },
        
    ])

    return (
        <>
            <Text style={globalStyles.title}>Registro de negocio</Text>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={globalStyles.textField}
            />
            <DropDownPicker
                placeholder="Selecciona una categoría"
                open={open}
                value={category}
                items={items}
                setOpen={setOpen}
                setValue={setCategory}
                setItems={setItems}
                onChangeValue={setCategory}
                style={globalStyles.textField}
            />
            <TextInput
                placeholder="Description"
                multiline
                numberOfLines={3}
                maxLength={150}
                value={description}
                onChangeText={setDescription}
                style={globalStyles.textField}
            />

            <Pressable style={globalStyles.button} onPress={onNext}>
                <Text style={{ color: '#fff' }}>Siguiente</Text>
            </Pressable>
            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
        </>
    )
}
