import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import globalStyles from '../styles/global'

export default function SearchBar({
    searchTerm,
    setSearchTerm,
    placeholder = 'Busca un negocio',
    style = {},
    showIcon = false,
}) {
    return (
        <View style={[styles.container, style]}>
            <TextInput
                style={globalStyles.textField}
                placeholder="Busca un negocio por nombre, categoria, etc."
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 10,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
})
