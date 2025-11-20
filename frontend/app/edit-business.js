import React from 'react'
import {
    View,
    Button,
    Image,
    ActivityIndicator,
    StyleSheet,
    Alert,
    Pressable,
    Text,
    ScrollView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { uploadBusinessPicture, getBusiness } from '../api/business-service'
import { useRouter } from 'expo-router'
import { useSearchParams } from 'expo-router/build/hooks'
import Screen from '../components/screen'
import { globalStyles } from '../styles/global'
import { Ionicons } from '@expo/vector-icons'
import LoadingSpinner from '../components/loading-spinner'

export default function EditBusiness() {
    const params = useSearchParams()
    const router = useRouter()

    // Obtener el ID del negocio desde los parámetros de la URL
    const businessId = params.get('businessId') || params.get('id')

    const [business, setBusiness] = React.useState(null)
    const [image, setImage] = React.useState(null)
    const [uploading, setUploading] = React.useState(false)
    const [loading, setLoading] = React.useState(true)

    // Cargar datos del negocio
    React.useEffect(() => {
        const fetchBusiness = async () => {
            if (!businessId) {
                Alert.alert('Error', 'No se proporcionó un ID de negocio')
                router.back()
                return
            }

            try {
                setLoading(true)
                const foundBusiness = await getBusiness(businessId)

                if (foundBusiness) {
                    setBusiness(foundBusiness)
                    setImage(foundBusiness.profile_pic || null)
                } else {
                    Alert.alert('Error', 'Negocio no encontrado')
                    router.back()
                }
            } catch (error) {
                console.error('Error al cargar negocio:', error)
                Alert.alert('Error', 'No se pudo cargar el negocio')
            } finally {
                setLoading(false)
            }
        }

        fetchBusiness()
    }, [businessId])

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    const handleUpload = async () => {
        if (!image || !businessId) return

        setUploading(true)
        try {
            const filename = image.split('/').pop()

            console.log('📤 Subiendo imagen de negocio:', {
                businessId,
                filename,
            })

            const updatedBusiness = await uploadBusinessPicture(
                businessId,
                image,
                filename
            )

            console.log('✅ Negocio actualizado:', updatedBusiness)

            // Actualizar el estado local con el negocio actualizado
            setBusiness(updatedBusiness)
            setImage(updatedBusiness.profile_pic)

            Alert.alert('Éxito', 'Foto del negocio actualizada correctamente')
        } catch (error) {
            console.error('❌ Error al subir imagen:', error)
            Alert.alert(
                'Error',
                error.message || 'No se pudo subir la foto del negocio'
            )
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <Screen>
                <View style={styles.container}>
                    <LoadingSpinner />
                </View>
            </Screen>
        )
    }

    if (!business) {
        return (
            <Screen>
                <View style={styles.container}>
                    <Ionicons name="alert-circle" size={64} color="#999" />
                    <Text style={globalStyles.title}>
                        Negocio no encontrado
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
                        style={[globalStyles.button, { marginTop: 20 }]}
                    >
                        <Text style={{ color: '#fff' }}>Volver</Text>
                    </Pressable>
                </View>
            </Screen>
        )
    }

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <Ionicons
                            name="business"
                            size={200}
                            color="#ccc"
                            style={styles.placeholderIcon}
                        />
                    )}

                    <Pressable onPress={pickImage} style={globalStyles.button}>
                        <Ionicons
                            name="image"
                            size={20}
                            color="#fff"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={{ color: '#fff' }}>
                            Seleccionar imagen
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={handleUpload}
                        disabled={!image || uploading}
                        style={[
                            globalStyles.button,
                            (!image || uploading) && styles.buttonDisabled,
                        ]}
                    >
                        <Ionicons
                            name={
                                uploading ? 'cloud-upload' : 'checkmark-circle'
                            }
                            size={20}
                            color="#fff"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={{ color: '#fff' }}>
                            {uploading ? 'Subiendo...' : 'Confirmar cambios'}
                        </Text>
                    </Pressable>

                    {uploading && (
                        <ActivityIndicator
                            size="large"
                            color="#9B59B6"
                            style={{ marginTop: 20 }}
                        />
                    )}
                </View>
            </ScrollView>
        </Screen>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        gap: 8,
    },
    backButtonText: {
        color: '#9B59B6',
        fontSize: 16,
        fontWeight: '600',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 16,
        marginVertical: 20,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#f0f0f0',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    placeholderIcon: {
        marginVertical: 20,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
})
