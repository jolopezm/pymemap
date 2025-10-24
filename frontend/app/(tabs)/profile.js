import { Text, TextInput, Pressable, FlatList, View, ScrollView } from 'react-native'
import Screen from '../../components/screen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getBusiness } from '../../api/business-service'
import { updateUser, deleteUser } from '../../api/user-service'
import { useAuth } from '../../context/auth-context'
import { useRouter } from 'expo-router'
import React from 'react'
import Item from '../../plantillas/business-item'
import globalStyles from '../../styles/global'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Button from '../../components/button'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
    const { isAuthenticated, logout } = useAuth()
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

    return isAuthenticated ? (
        <Screen scroll={false}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
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
                        business => String(business.owner_id) === String(userId)
                    ).length > 0 ? (
                        <View style={{ width: '100%' }}>
                            {businesses
                                .filter(business => String(business.owner_id) === String(userId))
                                .map((item) => (
                                    <Item 
                                        key={item._id ?? item.id ?? item.name} 
                                        business={item} 
                                    />
                                ))
                            }
                        </View>
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
                            <Text style={{ color: '#fff' }}>Editar datos</Text>
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
                        <Text style={{ color: '#fff' }}>Registrar negocio</Text>
                    </Pressable>

                    <Pressable
                        style={[globalStyles.button, globalStyles.button.red]}
                        onPress={handleDeleteAccount}
                    >
                        <Text style={{ color: '#fff' }}>Eliminar cuenta</Text>
                    </Pressable>

                    <Pressable
                        style={[globalStyles.button, globalStyles.button.red]}
                        onPress={handleLogout}
                    >
                        <Text style={{ color: '#fff' }}>Cerrar Sesión</Text>
                    </Pressable>
                </ScrollView>
        </Screen>
    ) : (
        <LinearGradient
            colors={['#9B59B6', '#F8BBD9']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 30,
                        paddingBottom: 0,
                    }}
                >
                                {/* Icono principal */}
                                <View
                                    style={[
                                        globalStyles.logoContainer,
                                        { marginBottom: 20 },
                                    ]}
                                >
                                    <Ionicons
                                        name="person-circle"
                                        size={90}
                                        color="#FFFFFF"
                                    />
                                </View>

                                {/* Título */}
                                <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 15 }]}>
                                    ¡Únete a PymeMap!
                                </Text>

                                {/* Subtítulo */}
                                <Text
                                    style={[
                                        globalStyles.subtitle,
                                        { marginBottom: 25, textAlign: 'center' },
                                    ]}
                                >
                                    Crea tu cuenta y accede a todas las funciones
                                </Text>

                                {/* Lista de beneficios */}
                                <View style={{ width: '100%', marginBottom: 25 }}>
                                    <BenefitItem
                                        icon="business"
                                        text="Gestiona tus negocios"
                                    />
                                    <BenefitItem
                                        icon="wallet"
                                        text="Pagos seguros"
                                    />
                                    <BenefitItem
                                        icon="time"
                                        text="Historial de servicios"
                                    />
                                    <BenefitItem
                                        icon="star"
                                        text="Y mucho más"
                                    />
                                </View>

                                {/* Botones */}
                                <View style={{ width: '100%' }}>
                                    <Button
                                        title="Crear cuenta"
                                        variant="primary"
                                        onPress={() => router.push('/sign-in')}
                                        style={{ marginBottom: 12 }}
                                    />

                                    <Button
                                        title="Iniciar sesión"
                                        variant="secondary"
                                        onPress={() => router.push('/login')}
                                        style={{ marginBottom: 20 }}
                                    />

                                    {/* Link mejorado para continuar sin cuenta */}
                                    <Pressable 
                                        onPress={() => router.push('/(tabs)/home')} 
                                        style={{ 
                                            alignSelf: 'center',
                                            paddingVertical: 8,
                                            paddingHorizontal: 16,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.85)',
                                                fontSize: 14,
                                                fontWeight: '400',
                                                textDecorationLine: 'none',
                                            }}
                                        >
                                            Explorar sin cuenta
                                        </Text>
                            </Pressable>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
    )
}// Componente auxiliar para los items de beneficios
function BenefitItem({ icon, text }) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: 12,
                borderRadius: 10,
            }}
        >
            <View
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 12,
                }}
            >
                <Ionicons name={icon} size={22} color="#FFFFFF" />
            </View>
            <Text
                style={{
                    color: '#FFFFFF',
                    fontSize: 15,
                    fontWeight: '500',
                    flex: 1,
                }}
                numberOfLines={1}
            >
                {text}
            </Text>
        </View>
    )
}
