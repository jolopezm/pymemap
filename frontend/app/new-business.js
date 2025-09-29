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
import GoogleMapsWebView from '../components/gmaps-view'
import Screen from '../components/screen'
import NameCategoryForm from '../templates/name-category-form'
import AddressMapForm from '../templates/address-map-form'

export default function NewBusiness() {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [ownerId, setOwnerId] = useState('')
    const [error, setError] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [step, setStep] = useState(1)
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

    // Props para los formularios
    const formProps = {
        name,
        setName,
        category,
        setCategory,
        description,
        setDescription,
        ownerId,
        setOwnerId,
        error,
        setError,
        onNext: () => setStep(2),
    }

    const addressProps = {
        address,
        setAddress,
        suggestions,
        setSuggestions,
        fetchAddressSuggestions,
        error,
        setError,
        onBack: () => setStep(1),
        onSubmit: () => {
            handleSignIn()
        },
    }

    return (
        <>
            {step === 1 ? (
                <NameCategoryForm {...formProps} />
            ) : (
                <AddressMapForm {...addressProps} />
            )}
            <Link href="/home">
                <Text style={{ color: 'blue' }}>Ir a home</Text>
            </Link>
        </>
    )
}
