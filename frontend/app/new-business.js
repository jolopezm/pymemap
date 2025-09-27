import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Pressable,
    TextInput,
    TouchableOpacity,
    FlatList,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { createBusiness } from '../api/business-service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchAddressSuggestions } from '../api/gmaps-service'
import globalStyles from '../styles/global'

export default function NewBusiness() {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [ownerId, setOwnerId] = useState('')
    const [error, setError] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const router = useRouter()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('user')
                if (userData) {
                    const parsedUser = JSON.parse(userData)
                    setOwnerId(parsedUser._id || '')
                }
            } catch (error) {}
        }
        fetchUserData()
    }, [])

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

    const handleSignIn = () => {
        if (!name || !address || !category || !description || !ownerId) {
            setError('Todos los campos son obligatorios')
            return
        }
        setError('')
        createBusiness({
            name,
            address,
            category,
            description,
            owner_id: ownerId,
        })
            .then(response => {
                router.push('/profile')
            })
            .catch(err => {
                setError('Error al crear negocio')
            })
    }

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Registro de negocio</Text>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={globalStyles.textField}
            />
            <TextInput
                placeholder="Address"
                value={address}
                onChangeText={handleAddressChange}
                style={globalStyles.textField}
            />
            {/* Sugerencias de direcciones */}
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
            <TextInput
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
                style={globalStyles.textField}
            />
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={globalStyles.textField}
            />
            <TextInput
                placeholder="OwnerId"
                value={ownerId}
                onChangeText={setOwnerId}
                style={globalStyles.textField}
                editable={false}
            />

            <Pressable style={globalStyles.button} onPress={handleSignIn}>
                <Text style={{ color: '#fff' }}>Confirmar</Text>
            </Pressable>

            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

            <Link href="/home">
                <Text style={{ color: 'blue' }}>Ir a home</Text>
            </Link>
        </View>
    )
}
