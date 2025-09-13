import React, { useState, useEffect } from 'react'
import { View, Text, Button, Pressable, TextInput } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { createBusiness } from '../api/business-service'
import AsyncStorage from '@react-native-async-storage/async-storage'

import globalStyles from '../styles/global'

export default function NewBusiness() {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
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
                onChangeText={setAddress}
                style={globalStyles.textField}
            />
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
