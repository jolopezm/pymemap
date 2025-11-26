import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Pressable, View, Text } from 'react-native'
import { openBrowserAsync } from 'expo-web-browser'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function ExpoWebBrowserExample({
    url,
    title = 'Ir a MercadoPago',
}) {
    const router = useRouter()

    const handlePress = async () => {
        await openBrowserAsync(url)
        setTimeout(() => {
            router.push('/(tabs)/home')
        }, 1000)
    }

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
            ]}
        >
            <Ionicons
                name="open-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#009EE3',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
})
