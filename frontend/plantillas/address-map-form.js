import React from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Pressable,
    Platform,
} from 'react-native'
import globalStyles from '../styles/global'
import GmapsView from '../components/gmaps-view'

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
}) {
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

    const isMobile = Platform.OS === 'ios' || Platform.OS === 'android'

    return (
        <>
            <Text style={globalStyles.title}>Dirección del negocio</Text>
            <TextInput
                placeholder="Address"
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
                        height="200px"
                        isOnMobile={isMobile}
                    />
                </View>
            ) : null}
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
