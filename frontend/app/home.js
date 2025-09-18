import { View, Text, Pressable } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import globalStyles from '../styles/global'

export default function Home() {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

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

            <Link href="/about">
                <Text style={{ color: 'blue' }}>Sobre nosotros</Text>
            </Link>
        </View>
    )
}
