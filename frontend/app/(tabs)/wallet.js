import { View, Text, StyleSheet, Button } from 'react-native'
import Screen from '../../components/screen'
import globalStyles from '../../styles/global'
import { useAuth } from '../../context/auth-context'
import { updateBalance } from '../../api/user-service'
import React from 'react'
import { useRouter } from 'expo-router'

export default function WalletScreen() {
    const { user, refreshUser } = useAuth()

    const handleAddBalance = async () => {
        try {
            await updateBalance(user?._id, 50)
            await refreshUser()
        } catch (error) {
            console.error('Error adding balance:', error)
        }
    }

    const handleDeductBalance = async () => {
        try {
            await updateBalance(user?._id, 20, false)
            await refreshUser()
        } catch (error) {
            console.error('Error deducting balance:', error)
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
            <Button title="Deduct Money (-20)" onPress={handleDeductBalance} />
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
