import { Stack } from 'expo-router'
import {
    SafeAreaProvider,
    initialWindowMetrics,
} from 'react-native-safe-area-context'
import { AuthProvider } from '../context/auth-context'
import { NotifProvider } from '../context/notif-context'
import ToastManager from 'toastify-react-native' // <-- 1. Importar
import { StatusBar } from 'expo-status-bar'

export default function Layout() {
    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <StatusBar style="light" backgroundColor="#9B59B6" />
            <AuthProvider>
                <ToastManager />
                <NotifProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="home" options={{ title: 'Home' }} />
                    <Stack.Screen name="about" options={{ title: 'About' }} />
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

                </Stack>
                </NotifProvider>
            </AuthProvider>
        </SafeAreaProvider>
    )
}
