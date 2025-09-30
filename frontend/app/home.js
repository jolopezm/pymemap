import { useState, useEffect } from 'react'
import { View, Text, Pressable, Button } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import DefaultModal from '../components/default-modal'
import globalStyles from '../styles/global'
import Screen from '../components/screen'
import SearchBar from '../components/search-bar'
import { getBusiness } from '../api/business-service'
import Item from '../plantillas/business-item'

export default function Home() {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter()
    const [modalVisible, setModalVisible] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState([])

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    const handleModal = () => {
        setModalVisible(!modalVisible)
    }

    useEffect(() => {
        if (searchTerm.length === 0) {
            setResults([])
            return
        }
        let isMounted = true
        getBusiness()
            .then(data => {
                if (isMounted) {
                    const filtered = data.filter(b =>
                        b.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    setResults(filtered)
                }
            })
            .catch(() => setResults([]))
        return () => {
            isMounted = false
        }
    }, [searchTerm])

    return (
        <>
            <Text style={globalStyles.title}>
                Bienvenido, {isAuthenticated ? user?.name : 'Invitado'}
            </Text>

            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            {results.length > 0 && (
                <View style={{ width: '100%', marginBottom: 10 }}>
                    {results.map(business => (
                        <Item key={business._id} business={business} />
                    ))}
                </View>
            )}

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

            <Link href="/about">
                <Text style={{ color: 'blue' }}>Sobre nosotros</Text>
            </Link>
        </>
    )
}
