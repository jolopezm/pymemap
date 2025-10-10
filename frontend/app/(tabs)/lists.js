import { View, Text, StyleSheet } from 'react-native'

export default function ListsScreen() {
    return (
        <View style={styles.container}>
            <Text>Lists Screen</Text>
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
