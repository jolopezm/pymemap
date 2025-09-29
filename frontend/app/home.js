import { useState } from 'react'
import { View, Text, Pressable, Button } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import DefaultModal from '../components/default-modal'
import globalStyles from '../styles/global'
import Screen from '../components/screen'
import GoogleMapsWebView from '../components/GoogleMapsWebView'

export default function Home() {
    const { user, isAuthenticated, logout } = useAuth()
    const [address, setAddress] = useState(
        'Juan de Dios Vial 100, Providencia, Chile'
    )
    const router = useRouter()
    const [modalVisible, setModalVisible] = useState(false)

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    const handleModal = () => {
        setModalVisible(!modalVisible)
    }

    return (
        <Screen>
            <Text style={globalStyles.title}>
                Bienvenido, {isAuthenticated ? user?.name : 'Invitado'}
            </Text>

            {isAuthenticated ? (
                <View>
                    <Pressable
                        style={[globalStyles.button]}
                        onPress={() => router.push('/profile')}
                    >
                        <Text style={{ color: '#fff' }}>Ver perfil</Text>
                    </Pressable>

                    <Pressable
                        style={[globalStyles.button]}
                        onPress={() => router.push('/new-business')}
                    >
                        <Text style={{ color: '#fff' }}>Registrar negocio</Text>
                    </Pressable>

                    <Pressable
                        style={[globalStyles.button, globalStyles.button.red]}
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

            <Button title="Abrir modal" onPress={handleModal} />
            {modalVisible && (
                <DefaultModal
                    visible={modalVisible}
                    onRequestClose={handleModal}
                >
                    <Text style={globalStyles.title}>
                        Código de autenticacion
                    </Text>
                    <Text>Contenido del modal</Text>
                    <Button title="Cerrar modal" onPress={handleModal} />
                </DefaultModal>
            )}

            <Text style={[globalStyles.title, { marginTop: 20 }]}>
                Ubicación de ejemplo
            </Text>
            {/* Mapa de Google Maps */}
            <GoogleMapsWebView address={address} height={200} />

            <Link href="/about">
                <Text style={{ color: 'blue' }}>Sobre nosotros</Text>
            </Link>
        </Screen>
    )
}
