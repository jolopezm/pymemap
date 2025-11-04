import { Stack } from 'expo-router'
import {
    SafeAreaProvider,
    initialWindowMetrics,
} from 'react-native-safe-area-context'
import { AuthProvider } from '../context/auth-context'
import { NotifProvider } from '../context/notif-context'
import ToastManager from 'toastify-react-native'

export default function Layout() {
    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <AuthProvider>
                <ToastManager />
                <NotifProvider>
                    <Stack screenOptions={{ headerShown: true }}>
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="about"
                            options={{ title: 'About' }}
                        />
                        <Stack.Screen
                            name="search"
                            options={{
                                title: 'Buscar',
                                presentation: 'transparentModal',
                                animation: 'fade',
                                animationDuration: 200,
                            }}
                        />
                        <Stack.Screen
                            name="login"
                            options={{ title: 'Iniciar Sesión' }}
                        />
                        <Stack.Screen
                            name="sign-in"
                            options={{ title: 'Registro de usuario' }}
                        />
                        <Stack.Screen
                            name="auth-code"
                            options={{ title: 'Código de verificación' }}
                        />
                        <Stack.Screen
                            name="profile"
                            options={{ title: 'Perfil de usuario' }}
                        />
                        <Stack.Screen
                            name="business/[id]"
                            options={{ title: 'Detalle del negocio' }}
                        />
                        <Stack.Screen
                            name="new-business"
                            options={{ title: 'Nuevo negocio' }}
                        />
                        <Stack.Screen
                            name="edit-business"
                            options={{ title: 'Editar negocio' }}
                        />
                        <Stack.Screen
                            name="upload-profile-pic"
                            options={{ title: 'Subir foto de perfil' }}
                        />
                        <Stack.Screen
                            name="businesses-list"
                            options={{ title: 'Mis negocios' }}
                        />
                        <Stack.Screen
                            name="edit-profile"
                            options={{ title: 'Editar perfil' }}
                        />
                        <Stack.Screen
                            name="settings"
                            options={{ title: 'Configuración' }}
                        />
                        <Stack.Screen
                            name="business-profile"
                            options={{ title: 'Perfil del negocio' }}
                        />
                    </Stack>
                </NotifProvider>
            </AuthProvider>
        </SafeAreaProvider>
    )
}
