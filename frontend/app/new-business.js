import { useState, useEffect } from 'react'
import { Text } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { createBusiness } from '../api/business-service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchAddressSuggestions } from '../api/gmaps-service'
import Screen from '../components/screen'
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
        <>
            {step === 1 ? (
                <BusinessDataForm {...formProps} />
            ) : (
                <AddressMapForm {...addressProps} />
            )}
            <Link href="/home">
                <Text style={{ color: 'blue' }}>Ir a home</Text>
            </Link>
        </>
    )
}
