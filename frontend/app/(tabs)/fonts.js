import { View, Text, StyleSheet } from 'react-native'

export default function FontsScreen() {
    return (
        <View style={styles.container}>
            <Text>Fonts Screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
