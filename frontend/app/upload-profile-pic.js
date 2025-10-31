import React from 'react';
import { View, Button, Image, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePicture } from '../api/user-service';
import { useAuth } from '../context/auth-context';

export default function UploadProfilePic() {
    const { user, setUser } = useAuth();
    const [image, setImage] = React.useState(null);
    const [uploading, setUploading] = React.useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    const handleUpload = async () => {
        if (!image) return;

        setUploading(true);
        try {
            const filename = image.split('/').pop();

            console.log('📤 Subiendo imagen:', { 
                userId: user._id || user.id, 
                filename,
                userIdLength: (user._id || user.id)?.length
            });

            // Usar user._id (como viene de MongoDB) o user.id
            const userId = user._id || user.id;
            
            if (!userId || userId.length !== 24) {
                throw new Error(`ID de usuario inválido: ${userId}`);
            }

            const updatedUser = await uploadProfilePicture(userId, image, filename);
            
            console.log('✅ Usuario actualizado:', updatedUser);

            // Actualizar el contexto con el usuario completo actualizado
            setUser({ ...user, profile_pic: updatedUser.profile_pic });
            
            Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
        } catch (error) {
            console.error('❌ Error al subir imagen:', error);
            Alert.alert(
                'Error', 
                error.response?.data?.detail || error.message || 'No se pudo subir la foto de perfil'
            );
        } finally {
            setUploading(false);
        }
    }

    return (
        <View style={styles.container}>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <Button title="Seleccionar imagen" onPress={pickImage} />
            <Button 
                title={uploading ? "Subiendo..." : "Subir foto de perfil"} 
                onPress={handleUpload} 
                disabled={!image || uploading} 
            />
            {uploading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
    );
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
    },
});