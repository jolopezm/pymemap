import { View, Text, ScrollView } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import { globalStyles, colors } from '../styles/theme'
import Button from '../components/ui/Button'
import DismissKeyboard from '../components/dismiss-keyboard'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

export default function Settings() {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    return (
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
                    <View
                        style={[
                            globalStyles.gradientContainer,
                            { paddingVertical: 30 },
                        ]}
                    >
                        <View style={globalStyles.logoContainer}>
                            <Ionicons
                                name="settings"
                                size={64}
                                color="#FFFFFF"
                            />
                        </View>

                        <Text style={globalStyles.title}>
                            Bienvenido,{' '}
                            {isAuthenticated ? user?.name : 'Invitado'}
                        </Text>

                        {isAuthenticated ? (
                            <View style={{ width: '100%' }}>
                                <Button
                                    title="Ver perfil"
                                    variant="secondary"
                                    onPress={() => router.push('/profile')}
                                    style={{ marginBottom: 10 }}
                                />

                                <Button
                                    title="Registrar negocio"
                                    variant="primary"
                                    onPress={() => router.push('/new-business')}
                                    style={{ marginBottom: 10 }}
                                />

                                <Button
                                    title="Cerrar Sesión"
                                    variant="primary"
                                    onPress={handleLogout}
                                    style={{
                                        marginBottom: 20,
                                        backgroundColor: '#E74C3C',
                                    }}
                                />
                            </View>
                        ) : (
                            <Button
                                title="Iniciar Sesión"
                                variant="primary"
                                onPress={() => router.push('/login')}
                                style={{ marginBottom: 20 }}
                            />
                        )}

                        <Button
                            title="ℹ️ Sobre nosotros"
                            variant="outline"
                            onPress={() => router.push('/about')}
                            style={{
                                marginTop: 20,
                                borderColor: 'rgba(255, 255, 255, 0.7)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }}
                        />
                    </View>
                </ScrollView>
            </LinearGradient>
        </DismissKeyboard>
    )
}
