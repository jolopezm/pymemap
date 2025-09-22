import { useState } from 'react'
import { View, Text, Pressable, Button } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import DefaultModal from '../components/default-modal'
import MapboxMap from '../components/MapboxMap' // Importamos el nuevo componente
import globalStyles from '../styles/global'

export default function Home() {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter()
    const [modalVisible, setModalVisible] = useState(false)

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    const handleModal = () => {
        setModalVisible(!modalVisible)
    }

    // Coordenadas de ejemplo (Plaza de Armas, Santiago)
    // Formato: [longitud, latitud]
    const exampleCoordinates = [-70.6504, -33.4378]

    return (
        <View style={globalStyles.container}>
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

            <Button title="Abrir modal con mapa" onPress={handleModal} />
            {modalVisible && (
                <DefaultModal
                    visible={modalVisible}
                    onRequestClose={handleModal}
                >
                    <Text style={globalStyles.title}>Ubicación de Ejemplo</Text>
                    <MapboxMap
                        centerCoordinate={exampleCoordinates}
                        markerCoordinate={exampleCoordinates}
                    />
                    <Button title="Cerrar" onPress={handleModal} />
                </DefaultModal>
            )}

            <Link href="/about">
                <Text style={{ color: 'blue' }}>Sobre nosotros</Text>
            </Link>
        </View>
    )
}
