import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { createBusiness } from '../api/business-service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchAddressSuggestions } from '../api/gmaps-service'
import { globalStyles } from '../styles/global'
import Button from '../components/button'
import DismissKeyboard from '../components/dismiss-keyboard'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import BusinessDataForm from '../plantillas/business-data-form'
import AddressMapForm from '../plantillas/address-map-form'
import { Toast } from 'toastify-react-native'

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

    const handleSignIn = () => {
        if (!name || !address || !category || !description || !ownerId) {
            setError('Todos los campos son obligatorios')
            Toast.error(error, { duration: 3000 })
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
        <DismissKeyboard>
            <LinearGradient
                colors={['#9B59B6', '#F8BBD9']}
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[globalStyles.gradientContainer, { paddingVertical: 30 }]}>
                        {/* Icono de negocio */}
                        <View style={globalStyles.logoContainer}>
                            <Ionicons name="storefront" size={64} color="#FFFFFF" />
                        </View>

                        <Text style={globalStyles.title}>
                            {step === 1 ? 'Nuevo Negocio' : 'Ubicación'}
                        </Text>

                        {step === 1 ? (
                            <BusinessDataForm {...formProps} />
                        ) : (
                            <AddressMapForm {...addressProps} />
                        )}

                        <Button
                            title="🏠 Volver al inicio"
                            variant="outline"
                            onPress={() => router.push('/home')}
                            style={{ 
                                marginTop: 20,
                                borderColor: 'rgba(255, 255, 255, 0.7)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }}
                        />
                    </View>
                </ScrollView>
            </LinearGradient>
        </DismissKeyboard>
    )
}
