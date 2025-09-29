import React from 'react'
import { Text, TextInput, Pressable } from 'react-native'
import globalStyles from '../styles/global'

export default function NameCategoryForm({
    name,
    setName,
    category,
    setCategory,
    description,
    setDescription,
    ownerId,
    setOwnerId,
    error,
    setError,
    onNext,
}) {
    return (
        <>
            <Text style={globalStyles.title}>Registro de negocio</Text>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={globalStyles.textField}
            />
            <TextInput
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
                style={globalStyles.textField}
            />
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={globalStyles.textField}
            />
            <TextInput
                placeholder="OwnerId"
                value={ownerId}
                onChangeText={setOwnerId}
                style={globalStyles.textField}
                editable={false}
            />
            <Pressable style={globalStyles.button} onPress={onNext}>
                <Text style={{ color: '#fff' }}>Siguiente</Text>
            </Pressable>
            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
        </>
    )
}
