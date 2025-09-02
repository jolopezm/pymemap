import { Stack } from 'expo-router';
import { AuthProvider } from '../context/auth-context';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="home" options={{ title: "Home" }}/>
        <Stack.Screen name="about" options={{ title: "About" }}/>
        <Stack.Screen name="login" options={{ title: "Iniciar Sesión" }}/>
        <Stack.Screen name="sign-in" options={{ title: "Registro de usuario" }}/>
      </Stack>
    </AuthProvider>
  );
}

