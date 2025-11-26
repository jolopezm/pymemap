import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing } from '../../styles/theme'

export default function StoresMap() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                La vista de mapa no está disponible en la versión web.
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: spacing.lg,
    },
    text: {
        color: colors.textLight,
        fontSize: 16,
        textAlign: 'center',
    },
})
