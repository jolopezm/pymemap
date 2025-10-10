import { ActivityIndicator, View, StyleSheet } from 'react-native'

export default function LoadingSpinner() {
    return (
        <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    )
}

const styles = StyleSheet.create({
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        position: 'absolute',
        opacity: 0.8,
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
    },
})
