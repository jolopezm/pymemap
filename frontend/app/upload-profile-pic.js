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
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { uploadProfilePicture } from '../api/user-service'
import { useAuth } from '../context/auth-context'
import Screen from '../components/screen'
import BackButton from '../components/back-button'
import { globalStyles } from '../styles/global'
import { Ionicons } from '@expo/vector-icons'

export default function UploadProfilePic() {
    const { user, refreshUser } = useAuth()
    const [image, setImage] = React.useState(user.profile_pic || null)
    const [uploading, setUploading] = React.useState(false)

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
        if (!image) return

        setUploading(true)
        try {
            const filename = image.split('/').pop()

            console.log('📤 Subiendo imagen:', {
                userId: user._id || user.id,
                filename,
                userIdLength: (user._id || user.id)?.length,
            })

            const userId = user._id || user.id

            if (!userId || userId.length !== 24) {
                throw new Error(`ID de usuario inválido: ${userId}`)
            }

            const updatedUser = await uploadProfilePicture(
                userId,
                image,
                filename
            )

            console.log('✅ Usuario actualizado:', updatedUser)

            await refreshUser()
            Alert.alert('Éxito', 'Foto de perfil actualizada correctamente')
        } catch (error) {
            console.error('❌ Error al subir imagen:', error)
            Alert.alert(
                'Error',
                error.response?.data?.detail ||
                    error.message ||
                    'No se pudo subir la foto de perfil'
            )
        } finally {
            setUploading(false)
        }
    }

    return (
        <Screen>
            <BackButton />
            <View style={styles.container}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <Ionicons
                        name="person-circle"
                        size={200}
                        color="#ccc"
                        style={styles.profile_pic}
                    />
                )}

                <Pressable onPress={pickImage} style={globalStyles.button}>
                    <Text>Seleccionar imagen</Text>
                </Pressable>
                <Pressable
                    onPress={handleUpload}
                    disabled={!image || uploading}
                    style={globalStyles.button}
                >
                    <Text>{uploading ? 'Subiendo...' : 'Confirmar'}</Text>
                </Pressable>
                {uploading && (
                    <ActivityIndicator size="large" color="#0000ff" />
                )}
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 20,
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
})
