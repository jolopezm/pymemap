import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import globalStyles from '../styles/global'

export default function SearchBar({ searchTerm, setSearchTerm }) {
    return (
        <View style={styles.container}>
            <TextInput
                style={globalStyles.textField}
                placeholder="Busca un negocio"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            <Ionicons
                name="search"
                size={24}
                color="black"
                style={styles.icon}
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

    icon: {
        padding: 8,
    },
})
