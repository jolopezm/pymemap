import { View, Text, StyleSheet, Button } from 'react-native'
import Screen from '../../components/screen'
import globalStyles from '../../styles/global'
import { useAuth } from '../../context/auth-context'

export default function WalletScreen() {
    const { user } = useAuth()
    return (
        <Screen>
            <View>
                <View style={globalStyles.card}>
                    <Text>${user?.balance}</Text>
                </View>
            </View>
            <Button title="Add Money" onPress={() => {}} />
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
