import React from 'react';
import { View, Button, Image, ActivityIndicator, StyleSheet } from 'react-native';
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
            const response = await fetch(image);
            const blob = await response.blob();
            const filename = image.split('/').pop();

            const uploadedImageUrl = await uploadProfilePicture(user.id, image, filename);
            setUser({ ...user, profile_pic: uploadedImageUrl });
            alert('Profile picture uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload profile picture.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <View style={styles.container}>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <Button title="Pick an image from gallery" onPress={pickImage} />
            <Button title="Upload Profile Picture" onPress={handleUpload} disabled={!image || uploading} />
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