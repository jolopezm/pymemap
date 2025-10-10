import { Stack } from 'expo-router'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../context/auth-context'
import ToastManager from 'toastify-react-native' // <-- 1. Importar

export default function Layout() {
    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <StatusBar style="light" backgroundColor="#9B59B6" />
            <AuthProvider>
                <ToastManager />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#9B59B6' }
                    }}
                >
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
                </Stack>
            </AuthProvider>
        </SafeAreaProvider>
    )
}
