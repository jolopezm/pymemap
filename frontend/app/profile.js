import { useState, useEffect } from 'react'
import { View, Text, TextInput, FlatList, ScrollView } from 'react-native'
import { Link, useRouter } from 'expo-router'
import ProtectedRoute from '../components/protected-route'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getBusiness } from '../api/business-service'
import { updateUser, deleteUser } from '../api/user-service'
import { useAuth } from '../context/auth-context'
import globalStyles from '../styles/global'
import Button from '../components/button'
import DismissKeyboard from '../components/dismiss-keyboard'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Item from '../plantillas/business-item'

export default function Profile() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [businesses, setBusinesses] = useState([])
    const [userId, setUserId] = useState('')
    const [isEditting, setIsEditting] = useState(false)
    const { logout, checkAuthStatus } = useAuth()
    const router = useRouter()

    useEffect(() => {
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
        <ProtectedRoute>
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
                            {/* Icono de perfil */}
                            <View style={globalStyles.logoContainer}>
                                <Ionicons name="person-circle" size={64} color="#FFFFFF" />
                            </View>

                            <Text style={globalStyles.title}>Perfil de usuario</Text>
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

                            <Text style={[globalStyles.subtitle, { marginTop: 20 }]}>Mis negocios:</Text>
                            {businesses.filter(
                                business => String(business.owner_id) === String(userId)
                            ).length > 0 ? (
                                <View style={{ width: '100%', maxHeight: 250, marginVertical: 10 }}>
                                    <FlatList
                                        data={businesses.filter(
                                            business =>
                                                String(business.owner_id) === String(userId)
                                        )}
                                        renderItem={({ item }) => <Item business={item} />}
                                        keyExtractor={item => item._id}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>
                            ) : (
                                <Text style={[globalStyles.linkText, { textDecorationLine: 'none', textAlign: 'center', marginVertical: 10 }]}>
                                    No tienes negocios registrados.
                                </Text>
                            )}

                            {/* Botones de acción */}
                            {isEditting ? (
                                <Button
                                    title="Guardar cambios"
                                    variant="primary"
                                    onPress={handleSave}
                                    style={{ marginTop: 10 }}
                                />
                            ) : (
                                <Button
                                    title="Editar datos"
                                    variant="secondary"
                                    onPress={handleEdit}
                                    style={{ marginTop: 10 }}
                                />
                            )}

                            <Button
                                title="Cambiar contraseña"
                                variant="outline"
                                onPress={() => router.push('/change-password')}
                                style={{ marginTop: 10 }}
                            />

                            <Button
                                title="Eliminar cuenta"
                                variant="primary"
                                onPress={handleDeleteAccount}
                                style={{ marginTop: 10, backgroundColor: '#E74C3C' }}
                            />

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
        </ProtectedRoute>
    )
}
