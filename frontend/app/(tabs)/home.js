import { View, Text, Pressable, Button, StyleSheet } from 'react-native'
import globalStyles from '../../styles/global'
import Screen from '../../components/screen'

export default function HomeScreen() {
    return (
        <Screen>
            <View style={styles.container}>
                <Text>Home Screen</Text>
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
