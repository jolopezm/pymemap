import { Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function BackButton() {
    const goBack = () => {
        window.history.back()
    }

    return (
        <Pressable onPress={goBack} style={styles.button}>
            <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        padding: 6,
        backgroundColor: '#f0f0f0',
        alignItems: 'flex-start',
        justifyContent: 'center',

        width: 40,

        margin: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        borderRadius: 50,

        elevation: 5,
    },
})
