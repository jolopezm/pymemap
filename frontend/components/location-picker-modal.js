import React, { useState } from 'react'
import {
    View,
    Text,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getCurrentLocation, geocodeAddress } from '../utils/geolocation'

/**
 * Modal para cambiar la ubicación del usuario
 * Permite usar ubicación actual o buscar una dirección
 */
export default function LocationPickerModal({
    visible,
    onClose,
    onLocationSelected,
    currentAddress = '',
}) {
    const [searchAddress, setSearchAddress] = useState(currentAddress)
    const [isLoading, setIsLoading] = useState(false)

    const handleUseCurrentLocation = async () => {
        try {
            setIsLoading(true)
            const location = await getCurrentLocation()

            if (location) {
                onLocationSelected(location)
                Alert.alert('Ubicación actualizada', 'Se usó tu ubicación actual')
                onClose()
            } else {
                Alert.alert(
                    'Error',
                    'No se pudo obtener tu ubicación. Verifica los permisos.'
                )
            }
        } catch (error) {
            console.error('Error obteniendo ubicación:', error)
            Alert.alert('Error', 'No se pudo obtener tu ubicación')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearchAddress = async () => {
        if (!searchAddress.trim()) {
            Alert.alert('Error', 'Por favor ingresa una dirección')
            return
        }

        try {
            setIsLoading(true)
            const coords = await geocodeAddress(searchAddress)

            if (coords) {
                onLocationSelected({
                    address: searchAddress,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                })
                Alert.alert('Ubicación actualizada', `Se usó: ${searchAddress}`)
                onClose()
            } else {
                Alert.alert(
                    'No encontrado',
                    'No se encontró esa dirección. Intenta con otra.'
                )
            }
        } catch (error) {
            console.error('Error geocodificando dirección:', error)
            Alert.alert('Error', 'No se pudo buscar esa dirección')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <ScrollView
                                contentContainerStyle={styles.scrollContent}
                                keyboardShouldPersistTaps="handled"
                            >
                                {/* Header */}
                                <View style={styles.header}>
                                    <Text style={styles.title}>Cambiar ubicación</Text>
                                    <Pressable onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color="#333" />
                                    </Pressable>
                                </View>

                                {/* Usar ubicación actual */}
                                <Pressable
                                    style={styles.currentLocationButton}
                                    onPress={handleUseCurrentLocation}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <>
                                            <Ionicons
                                                name="navigate"
                                                size={24}
                                                color="#FFF"
                                            />
                                            <Text style={styles.currentLocationText}>
                                                Usar mi ubicación actual
                                            </Text>
                                        </>
                                    )}
                                </Pressable>

                                {/* Separador */}
                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>O</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* Buscar dirección */}
                                <Text style={styles.label}>Buscar dirección</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Antonio Varas 666, Ñuñoa"
                                    value={searchAddress}
                                    onChangeText={setSearchAddress}
                                    editable={!isLoading}
                                />

                                <Pressable
                                    style={[
                                        styles.searchButton,
                                        isLoading && styles.buttonDisabled,
                                    ]}
                                    onPress={handleSearchAddress}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#9B59B6" />
                                    ) : (
                                        <>
                                            <Ionicons
                                                name="search"
                                                size={20}
                                                color="#9B59B6"
                                            />
                                            <Text style={styles.searchButtonText}>
                                                Buscar
                                            </Text>
                                        </>
                                    )}
                                </Pressable>

                                {/* Info */}
                                <View style={styles.infoBox}>
                                    <Ionicons
                                        name="information-circle"
                                        size={20}
                                        color="#666"
                                    />
                                    <Text style={styles.infoText}>
                                        Tu ubicación se usa para mostrarte negocios cercanos
                                        y calcular distancias.
                                    </Text>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    currentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9B59B6',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 12,
    },
    currentLocationText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#999',
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 12,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: '#9B59B6',
    },
    searchButtonText: {
        color: '#9B59B6',
        fontSize: 15,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
})
