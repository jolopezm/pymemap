import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Pressable,
    Platform,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { globalStyles, colors } from '../styles/theme'
import GmapsView from '../components/gmaps-view'
import { getCurrentLocation } from '../utils/geolocation'

export default function AddressMapForm({
    address,
    setAddress,
    suggestions,
    setSuggestions,
    fetchAddressSuggestions,
    error,
    setError,
    onBack,
    onSubmit,
    // Nuevas props para coordenadas
    latitude,
    longitude,
    setLatitude,
    setLongitude,
}) {
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const handleAddressChange = async text => {
        setAddress(text)
        if (text.length > 2) {
            try {
                const results = await fetchAddressSuggestions(text, 'cl')
                setSuggestions(results)
            } catch (e) {
                setSuggestions([])
            }
        } else {
            setSuggestions([])
        }
    }

    const handleSuggestionPress = suggestion => {
        setAddress(suggestion.description)
        setSuggestions([])
    }

    const handleGetCurrentLocation = async () => {
        try {
            setIsGettingLocation(true)
            const location = await getCurrentLocation()
            
            if (location) {
                setAddress(location.address)
                if (setLatitude && setLongitude) {
                    setLatitude(location.latitude)
                    setLongitude(location.longitude)
                }
                Alert.alert('Ubicación obtenida', 'Se usó tu ubicación actual')
            } else {
                Alert.alert(
                    'Error',
                    'No se pudo obtener tu ubicación. Verifica los permisos.'
                )
            }
        } catch (err) {
            console.error('Error obteniendo ubicación:', err)
            Alert.alert('Error', 'No se pudo obtener tu ubicación')
        } finally {
            setIsGettingLocation(false)
        }
    }

    const isMobile = Platform.OS === 'ios' || Platform.OS === 'android'

    return (
        <>
            <Text style={globalStyles.title}>Dirección del negocio</Text>
            
            {/* Botón para usar ubicación actual */}
            <Pressable
                style={styles.locationButton}
                onPress={handleGetCurrentLocation}
                disabled={isGettingLocation}
            >
                {isGettingLocation ? (
                    <ActivityIndicator size="small" color="#9B59B6" />
                ) : (
                    <Ionicons name="location" size={20} color="#9B59B6" />
                )}
                <Text style={styles.locationButtonText}>
                    {isGettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                </Text>
            </Pressable>

            <TextInput
                placeholder="Buscar dirección"
                value={address}
                onChangeText={handleAddressChange}
                style={globalStyles.textField}
            />
            {suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={item => item.place_id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleSuggestionPress(item)}
                        >
                            <Text
                                style={{
                                    padding: 8,
                                    backgroundColor: '#eee',
                                    borderBottomWidth: 1,
                                    borderColor: '#ccc',
                                }}
                            >
                                {item.description}
                            </Text>
                        </TouchableOpacity>
                    )}
                    style={{ maxHeight: 150, marginBottom: 10 }}
                />
            )}
            {address ? (
                <View style={{ height: 200, width: '100%', marginBottom: 20 }}>
                    <GmapsView
                        address={address}
                        latitude={latitude}
                        longitude={longitude}
                        height="200px"
                        isOnMobile={isMobile}
                    />
                </View>
            ) : null}
            
            {latitude && longitude && (
                <View style={styles.coordsInfo}>
                    <Text style={styles.coordsText}>
                        📍 Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </Text>
                </View>
            )}
            
            <Pressable style={globalStyles.button} onPress={onSubmit}>
                <Text style={{ color: '#fff' }}>Confirmar</Text>
            </Pressable>
            <Pressable style={globalStyles.button} onPress={onBack}>
                <Text style={{ color: '#fff' }}>Atrás</Text>
            </Pressable>
            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
        </>
    )
}

const styles = StyleSheet.create({
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#9B59B6',
        gap: 8,
    },
    locationButtonText: {
        color: '#9B59B6',
        fontSize: 14,
        fontWeight: '600',
    },
    coordsInfo: {
        backgroundColor: '#F0F0F0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    coordsText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
})
