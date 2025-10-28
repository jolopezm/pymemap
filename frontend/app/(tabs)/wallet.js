import { View, Text, StyleSheet, Button } from 'react-native'
import Screen from '../../components/screen'
import { globalStyles } from '../../styles/global'
import { useAuth } from '../../context/auth-context'
import { updateBalance } from '../../api/user-service'
import React from 'react'
import { useRouter } from 'expo-router'
//import ServiceFilter from '../../components/service-filter'

export default function WalletScreen() {
    const { user, refreshUser } = useAuth()

    cons

    return (
        <Screen>
            {user ? (
                <>
                    <Text style={globalStyles.title}>Wallet</Text>
                </>
            ) : (
                <Text>Please log in to view your wallet.</Text>
            )}
        </Screen>
    )
}
