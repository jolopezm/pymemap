import { View, Text, StyleSheet, Button } from 'react-native'
import Screen from '../../components/screen'
import globalStyles from '../../styles/global'
import { useAuth } from '../../context/auth-context'
import { addBalance } from '../../api/user-service'
import React from 'react'
import { useRouter } from 'expo-router'

export default function WalletScreen() {
    const { user, refreshUser } = useAuth()

    const handleAddBalance = async () => {
        try {
            await addBalance(user?._id, 50)
            await refreshUser()
        } catch (error) {
            console.error('Error adding balance:', error)
        }
    }

    return (
        <Screen>
            <View>
                <View style={globalStyles.card}>
                    <Text>${user?.balance}</Text>
                    <Text>{user?._id}</Text>
                </View>
            </View>
            <Button title="Add Money (+50)" onPress={handleAddBalance} />
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
