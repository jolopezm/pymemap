import {
    Text,
    Pressable,
    View,
    ScrollView,
    StyleSheet,
    Link,
    Image,
} from 'react-native'
import Screen from '../../components/screen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getBusiness } from '../../api/business-service'
import { useAuth } from '../../context/auth-context'
import { useRouter } from 'expo-router'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import ProfileNoUser from '../../plantillas/profile-no-user'

export default function ProfileScreen() {
    const { user, logout } = useAuth()
    const router = useRouter()

    // Usar directamente los datos del user del contexto
    const name = user?.name || ''
    const email = user?.email || ''

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    const handleDeleteAccount = async () => {
        try {
            await deleteUser(userId)
            await logout()
            router.push('/login')
        } catch (error) {
            console.error('Error deleting account:', error)
        }
    }

    return user ? (
        <Screen>
            <ScrollView style={{ flex: 1 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginVertical: 20,
                    }}
                >
                    <View style={styles.profilePictureContainer}>
                        <View style={styles.profilePicWrapper}>
                            {user?.profile_pic ? (
                                <Image
                                    source={{ uri: user.profile_pic }}
                                    style={styles.profile_pic}
                                />
                            ) : (
                                <Ionicons
                                    name="person-circle"
                                    size={120}
                                    color="#ccc"
                                    style={styles.profile_pic}
                                />
                            )}
                        </View>
                        <Pressable
                            style={styles.btn_update_pp}
                            onPress={() => router.push('/upload-profile-pic')}
                        >
                            <Ionicons name="camera" size={20} color="#000" />
                        </Pressable>
                    </View>
                    <View style={{ marginLeft: 20, flex: 1 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                            {name}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#555' }}>
                            {email}
                        </Text>
                    </View>
                </View>

                <View style={{ alignItems: 'right' }}>
                    <Pressable
                        style={styles.buttonContainer}
                        onPress={() => router.push('/edit-profile')}
                    >
                        <Ionicons
                            name="create-outline"
                            size={16}
                            color="#000"
                        />
                        <Text style={{ marginBottom: 10 }}>Editar perfil</Text>
                    </Pressable>

                    <Pressable
                        style={styles.buttonContainer}
                        onPress={() => router.push('/businesses-list')}
                    >
                        <Ionicons name="heart-outline" size={16} color="#000" />
                        <Text style={{ marginBottom: 10 }}>Favoritos</Text>
                    </Pressable>

                    <Pressable
                        style={styles.buttonContainer}
                        onPress={() => router.push('/businesses-list')}
                    >
                        <Ionicons
                            name="briefcase-outline"
                            size={16}
                            color="#000"
                        />
                        <Text style={{ marginBottom: 10 }}>
                            Ver mis negocios
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.buttonContainer}
                        onPress={() => router.push('/settings')}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={16}
                            color="#000"
                        />
                        <Text style={{ marginBottom: 20 }}>
                            Configuraciones
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.buttonContainer}
                        onPress={handleLogout}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={16}
                            color="#000"
                            style={{
                                transform: [{ rotate: '180deg' }],
                                color: '#FF4500',
                            }}
                        />
                        <Text style={{ color: '#FF4500' }}>Cerrar sesión</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </Screen>
    ) : (
        <ProfileNoUser />
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        gap: 5,
    },

    profilePictureContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },

    profilePicWrapper: {
        position: 'relative',
        width: 120,
        height: 120,
    },

    profile_pic: {
        width: 120,
        height: 120,
        borderRadius: 60,

        backgroundColor: '#f0f0f0',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    btn_update_pp: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
})
