import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Pressable,
    TextInput,
    FlatList,
    StyleSheet,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { createBusiness } from '../api/business-service'
import { getGeocodingSuggestions } from '../api/mapbox-service' // Importamos el nuevo servicio
import AsyncStorage from '@react-native-async-storage/async-storage'

import globalStyles from '../styles/global'

export default function NewBusiness() {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [addressSuggestions, setAddressSuggestions] = useState([])
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [ownerId, setOwnerId] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('user')
                if (userData) {
                    const parsedUser = JSON.parse(userData)
                    setOwnerId(parsedUser._id || '')
                }
            } catch (error) {
                //console.error('Error fetching user data:', error);
            }
        }

        fetchUserData()
    }, [])

    // Efecto para buscar direcciones con debouncing
    useEffect(() => {
        if (address.trim().length < 3) {
            setAddressSuggestions([])
            return
        }

        const handler = setTimeout(() => {
            const fetchSuggestions = async () => {
                const suggestions = await getGeocodingSuggestions(address)
                setAddressSuggestions(suggestions)
            }
            fetchSuggestions()
        }, 500) // Espera 500ms después de que el usuario deja de escribir

        return () => {
            clearTimeout(handler) // Limpia el temporizador si el usuario sigue escribiendo
        }
    }, [address])

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
                console.log('Negocio creado:', response)
            })
            .catch(err => {
                setError('Error al crear negocio')
            })
    }

    const handleSelectAddress = suggestion => {
        setAddress(suggestion.place_name) // Actualiza el campo de dirección
        setAddressSuggestions([]) // Oculta las sugerencias
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
            <View>
                <TextInput
                    placeholder="Address"
                    value={address}
                    onChangeText={setAddress}
                    style={globalStyles.textField}
                />
                {addressSuggestions.length > 0 && (
                    <FlatList
                        data={addressSuggestions}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.suggestionItem}
                                onPress={() => handleSelectAddress(item)}
                            >
                                <Text>{item.place_name}</Text>
                            </Pressable>
                        )}
                        style={styles.suggestionsContainer}
                    />
                )}
            </View>
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
                disabled
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

const styles = StyleSheet.create({
    suggestionsContainer: {
        backgroundColor: '#fff',
        borderRadius: 5,
        marginTop: -10,
        marginBottom: 10,
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
})
