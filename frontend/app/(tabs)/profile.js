import {
    Text,
    TextInput,
    Pressable,
    FlatList,
    View,
    StyleSheet,
} from 'react-native'
import Screen from '../../components/screen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getBusiness } from '../../api/business-service'
import { updateUser, deleteUser } from '../../api/user-service'
import { useAuth } from '../../context/auth-context'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import Item from '../../plantillas/business-item'
import globalStyles from '../../styles/global'
import { LinearGradient } from 'expo-linear-gradient'

export default function ProfileScreen() {
    const { user, isAuthenticated, logout, checkAuthStatus } = useAuth()
    const [name, setName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [birthdate, setBirthdate] = React.useState('')
    const [businesses, setBusinesses] = React.useState([])
    const [userId, setUserId] = React.useState('')
    const [isEditting, setIsEditting] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('user')
                if (userData) {
                    const parsedUser = JSON.parse(userData)
                    setName(parsedUser.name || '')
                    setEmail(parsedUser.email || '')
                    setBirthdate(parsedUser.birthdate || '')
                    setUserId(parsedUser._id || '')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }

        const fetchBusinesses = async () => {
            try {
                const data = await getBusiness()
                setBusinesses(data || [])
            } catch (error) {
                console.error('Error fetching businesses:', error)
            }
        }

        fetchUserData()
        fetchBusinesses()
    }, [])

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    const handleEdit = () => setIsEditting(true)

    const handleSave = () => {
        setIsEditting(false)
        const body = { name, email, birthdate }
        updateUser(userId, body)
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

    return (
        <Screen>
            <LinearGradient
                colors={['#9B59B6', '#F8BBD9']}
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                {isAuthenticated ? (
                    <View>
                        <View style={globalStyles.card}>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={globalStyles.textField}
                                editable={isEditting}
                                placeholder="Nombre"
                            />
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                style={globalStyles.textField}
                                editable={isEditting}
                                placeholder="Email"
                            />
                            <TextInput
                                value={birthdate}
                                onChangeText={setBirthdate}
                                style={globalStyles.textField}
                                editable={isEditting}
                                placeholder="Fecha de nacimiento"
                            />
                        </View>

                        <Text style={globalStyles.title}>Mis negocios:</Text>
                        {businesses.filter(
                            business =>
                                String(business.owner_id) === String(userId)
                        ).length > 0 ? (
                            <FlatList
                                style={{ width: '100%', maxHeight: 250 }}
                                data={businesses.filter(
                                    business =>
                                        String(business.owner_id) ===
                                        String(userId)
                                )}
                                renderItem={({ item }) => (
                                    <Item business={item} />
                                )}
                                keyExtractor={item =>
                                    item._id ?? item.id ?? item.name
                                }
                            />
                        ) : (
                            <Text>No tienes negocios registrados.</Text>
                        )}

                        {isEditting ? (
                            <Pressable
                                style={[
                                    globalStyles.button,
                                    globalStyles.button.green,
                                ]}
                                onPress={handleSave}
                            >
                                <Text style={{ color: '#000' }}>
                                    Guardar cambios
                                </Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                style={globalStyles.button}
                                onPress={handleEdit}
                            >
                                <Text style={{ color: '#fff' }}>
                                    Editar datos
                                </Text>
                            </Pressable>
                        )}

                        <Pressable
                            style={globalStyles.button}
                            onPress={() => router.push('/change-password')}
                        >
                            <Text style={{ color: '#fff' }}>
                                Cambiar contraseña
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[globalStyles.button]}
                            onPress={() => router.push('/new-business')}
                        >
                            <Text style={{ color: '#fff' }}>
                                Registrar negocio
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                globalStyles.button,
                                globalStyles.button.red,
                            ]}
                            onPress={handleDeleteAccount}
                        >
                            <Text style={{ color: '#fff' }}>
                                Eliminar cuenta
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                globalStyles.button,
                                globalStyles.button.red,
                            ]}
                            onPress={handleLogout}
                        >
                            <Text style={{ color: '#fff' }}>Cerrar Sesión</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        style={globalStyles.button}
                        onPress={() => router.push('/login')}
                    >
                        <Text style={{ color: '#fff' }}>Iniciar Sesión</Text>
                    </Pressable>
                )}
            </LinearGradient>
        </Screen>
    )
}
