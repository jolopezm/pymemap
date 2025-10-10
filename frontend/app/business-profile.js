import React from 'react'
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native'
import { useSearchParams } from 'expo-router/build/hooks'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import globalStyles from '../styles/global'
import Screen from '../components/screen'
import { getBusiness } from '../api/business-service'
import { LoadingSpinner } from '../components/loading-spinner'

// Fallbacks en caso de que alguna importación sea undefined
const ScreenComp =
    Screen || (({ children }) => <View style={{ flex: 1 }}>{children}</View>)
const LoadingComp =
    LoadingSpinner ||
    (() => (
        <View style={{ padding: 16 }}>
            <Text>Cargando...</Text>
        </View>
    ))

export default function BusinessProfile() {
    // Obtener el objeto completo de search params y aceptar variantes
    const params = useSearchParams()
    const router = useRouter()

    console.log('[BusinessProfile] Raw params:', params)
    console.log('[BusinessProfile] params.get("id"):', params?.get('id'))

    // URLSearchParams requiere usar .get() para acceder a los valores
    const idRaw =
        params?.get('id') ??
        params?.get('businessId') ??
        params?.get('bizId') ??
        null

    // Decodificar el ID para manejar caracteres especiales como espacios o acentos.
    const id = idRaw != null ? decodeURIComponent(String(idRaw)) : null

    console.log('[BusinessProfile] Resolved id:', id)
    const [business, setBusiness] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [lastResult, setLastResult] = React.useState(null)
    const [lastError, setLastError] = React.useState(null)

    React.useEffect(() => {
        let mounted = true
        const fetch = async () => {
            try {
                setLoading(true)
                console.log('[BusinessProfile] params=', params)
                console.log('[BusinessProfile] resolved id=', id)
                // El servicio se encarga de toda la lógica de búsqueda
                const foundBusiness = await getBusiness(id)
                console.log(
                    '[BusinessProfile] getBusiness result=',
                    foundBusiness
                )
                setLastResult(foundBusiness) // Guardar para debug
                if (!mounted) return

                setBusiness(foundBusiness) // Actualizar estado directamente
            } catch (error) {
                // logs detallados para errores HTTP
                if (error && error.response) {
                    console.log(
                        '[BusinessProfile] error response status=',
                        error.response.status
                    )
                    console.log(
                        '[BusinessProfile] error response data=',
                        error.response.data
                    )
                    setLastError({
                        status: error.response.status,
                        data: error.response.data,
                    })
                } else {
                    console.log('[BusinessProfile] error=', error)
                    setLastError({ message: String(error) })
                }
                setBusiness(null)
            } finally {
                if (mounted) setLoading(false)
            }
        }
        // Si id es falsy, no hacer nada.
        if (id) {
            fetch()
        } else {
            console.log(
                '[BusinessProfile] id vacío, no se intentará buscar por id'
            )
            setLoading(false)
        }
        return () => {
            mounted = false
        }
    }, [id]) // Depender solo del 'id' decodificado

    if (loading) {
        return (
            <ScreenComp>
                <LoadingComp />
            </ScreenComp>
        )
    }

    if (!business) {
        return (
            <ScreenComp>
                <View style={globalStyles.card}>
                    <Ionicons name="alert-circle" size={64} color="red" />
                    <Text>No se encontró el negocio</Text>
                    <View style={{ marginTop: 8 }}>
                        <Text style={{ fontSize: 12, color: '#333' }}>
                            Debug id resolved: {String(id ?? '')}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#333' }}>
                            Debug params: {JSON.stringify(params)}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#333' }}>
                            Resultado raw: {JSON.stringify(lastResult)}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#c00' }}>
                            Error: {JSON.stringify(lastError)}
                        </Text>
                    </View>
                    <Pressable onPress={() => router.push('/profile')}>
                        <Text style={{ color: 'blue' }}>Volver</Text>
                    </Pressable>
                </View>
            </ScreenComp>
        )
    }

    return (
        <ScreenComp>
            <View style={globalStyles.container}>
                <TextInput
                    style={globalStyles.textField}
                    placeholder="Nombre del negocio"
                    defaultValue={business?.name ?? ''}
                />
                <TextInput
                    style={globalStyles.textField}
                    placeholder="Descripción"
                    defaultValue={business?.description ?? ''}
                    multiline
                    numberOfLines={4}
                />
                <TextInput
                    style={globalStyles.textField}
                    placeholder="Ubicación"
                    defaultValue={business?.address ?? ''}
                />
                <Ionicons name="business" size={24} color="black" />
            </View>
        </ScreenComp>
    )
}
