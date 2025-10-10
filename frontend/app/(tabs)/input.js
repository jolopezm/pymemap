import { View, Text, StyleSheet } from 'react-native'

export default function InputScreen() {
    return (
        <View style={styles.container}>
            <Text>Input Screen</Text>
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
