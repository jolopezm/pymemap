import { Stack } from 'expo-router'
import {
    SafeAreaProvider,
    initialWindowMetrics,
} from 'react-native-safe-area-context'
import { AuthProvider } from '../context/auth-context'
import { NotifProvider } from '../context/notif-context'
import { LocationProvider } from '../context/location-context'
import { ChatProvider } from '../context/chat-context'
import ToastManager from 'toastify-react-native'

export default function Layout() {
    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <AuthProvider>
                <ToastManager />
                <NotifProvider>
                    <LocationProvider>
                        <ChatProvider>
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
                                    options={{
                                        title: 'Código de verificación',
                                    }}
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
                                <Stack.Screen
                                    name="service-detail"
                                    options={{ title: 'Detalle del servicio' }}
                                />
                                <Stack.Screen
                                    name="booking-detail"
                                    options={{ title: 'Detalle de la reserva' }}
                                />
                                <Stack.Screen
                                    name="bookings-panel"
                                    options={{ title: 'Panel de reservas' }}
                                />
                                <Stack.Screen
                                    name="book-a-service"
                                    options={{ title: 'Reserva un servicio' }}
                                />
                                <Stack.Screen
                                    name="chat-view"
                                    options={{ title: '' }}
                                />
                                <Stack.Screen
                                    name="report"
                                    options={{ title: 'Reportar' }}
                                />
                                <Stack.Screen
                                    name="forgot-password"
                                    options={{ title: 'Olvidé mi contraseña' }}
                                />
                                <Stack.Screen
                                    name="reset-password"
                                    options={{
                                        title: 'Restablecer contraseña',
                                    }}
                                />
                            </Stack>
                        </ChatProvider>
                    </LocationProvider>
                </NotifProvider>
            </AuthProvider>
        </SafeAreaProvider>
    )
}
