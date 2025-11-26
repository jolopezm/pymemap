import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Screen from '../../components/screen'
import { globalStyles, colors } from '../../styles/theme'

export default function CheckoutCongrats() {
    const params = useSearchParams()
    const router = useRouter()

    const status = params?.get('status') || 'unknown'
    const paymentId = params?.get('payment_id')
    const externalReference = params?.get('external_reference')

    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    icon: 'checkmark-circle',
                    iconColor: '#28a745',
                    title: '¡Pago Exitoso!',
                    message: 'Tu pago ha sido procesado correctamente.',
                    backgroundColor: '#d4edda',
                }
            case 'pending':
                return {
                    icon: 'time',
                    iconColor: '#ffc107',
                    title: 'Pago Pendiente',
                    message:
                        'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
                    backgroundColor: '#fff3cd',
                }
            case 'failure':
                return {
                    icon: 'close-circle',
                    iconColor: '#dc3545',
                    title: 'Pago Fallido',
                    message:
                        'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.',
                    backgroundColor: '#f8d7da',
                }
            default:
                return {
                    icon: 'help-circle',
                    iconColor: '#6c757d',
                    title: 'Estado Desconocido',
                    message: 'No pudimos determinar el estado de tu pago.',
                    backgroundColor: '#e2e3e5',
                }
        }
    }

    const config = getStatusConfig()

    return (
        <Screen>
            <View style={styles.container}>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: config.backgroundColor },
                    ]}
                >
                    <Ionicons
                        name={config.icon}
                        size={80}
                        color={config.iconColor}
                    />
                </View>

                <Text style={styles.title}>{config.title}</Text>
                <Text style={styles.message}>{config.message}</Text>

                {paymentId && (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>ID de Pago:</Text>
                        <Text style={styles.infoValue}>{paymentId}</Text>
                    </View>
                )}

                {externalReference && (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Referencia:</Text>
                        <Text style={styles.infoValue}>
                            {externalReference}
                        </Text>
                    </View>
                )}

                <Pressable
                    style={[globalStyles.button, { marginTop: 32 }]}
                    onPress={() => router.push('/(tabs)/my-bookings')}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        Ver Mis Reservas
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.secondaryButton, { marginTop: 16 }]}
                    onPress={() => router.push('/(tabs)/home')}
                >
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                        Volver al Inicio
                    </Text>
                </Pressable>
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    infoBox: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        width: '100%',
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    secondaryButton: {
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        width: '100%',
    },
})
