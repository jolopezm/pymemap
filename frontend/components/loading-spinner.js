import { ActivityIndicator, View, StyleSheet } from 'react-native'

export default function LoadingSpinner() {
    return (
        <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#9B59B6" />
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
        backgroundColor: 'rgba(245, 245, 245, 0.9)',
        width: '100%',
        height: '100%',
    },
})
