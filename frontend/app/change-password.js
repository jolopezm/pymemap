import { useState } from 'react' // No necesitas useEffect
import { View, Text, TextInput, Pressable, Alert } from 'react-native' // Añadido Alert
import { useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import { changePassword } from '../api/user-service'
import ProtectedRoute from '../components/protected-route'
import globalStyles from '../styles/global'

export default function ChangePassword() {
    // Eliminamos el estado userId, ya no es necesario
    const [currentPassword, setCurrentPassword] = useState('')
    const [passwordVisibility, setPasswordVisibility] = useState(true)
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const { user } = useAuth() // Usaremos este como única fuente de verdad
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Eliminamos el useEffect completo, ya no es necesario

    const handleChangePassword = async () => {
        setError('')
        setLoading(true)

        if (newPassword !== confirmNewPassword) {
            setError('Las contraseñas no coinciden')
            setLoading(false)
            return
        }

        try {
            // Usamos directamente el ID del usuario del contexto
            const userId = user?._id
            if (!userId) {
                setError(
                    'No se pudo obtener el ID de usuario. Intenta iniciar sesión de nuevo.'
                )
                setLoading(false)
                return
            }

            const passwords = {
                old_password: currentPassword,
                new_password: newPassword,
            }

            await changePassword(userId, passwords)

            Alert.alert('Éxito', 'Contraseña cambiada con éxito', [
                { text: 'OK', onPress: () => router.push('/profile') },
            ])
        } catch (error) {
            const errorMessage =
                error.response?.data?.detail || 'Error al cambiar la contraseña'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }
    return (
        <ProtectedRoute>
            <View style={globalStyles.container}>
                <Text style={globalStyles.title}>Cambiar Contraseña</Text>

                {passwordVisibility ? (
                    <>
                        <TextInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            style={globalStyles.textField}
                            placeholder="Contraseña actual"
                            secureTextEntry
                        />
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            style={globalStyles.textField}
                            placeholder="Nueva contraseña"
                            secureTextEntry
                        />
                        <TextInput
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            style={globalStyles.textField}
                            placeholder="Confirmar nueva contraseña"
                            secureTextEntry
                        />
                    </>
                ) : (
                    <>
                        <TextInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            style={globalStyles.textField}
                            placeholder="Contraseña actual"
                        />
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            style={globalStyles.textField}
                            placeholder="Nueva contraseña"
                        />
                        <TextInput
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            style={globalStyles.textField}
                            placeholder="Confirmar nueva contraseña"
                        />
                    </>
                )}

                {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

                {passwordVisibility ? (
                    <Pressable
                        style={globalStyles.button}
                        onPress={() =>
                            setPasswordVisibility(!passwordVisibility)
                        }
                    >
                        <Text style={{ color: '#fff' }}>Ver contraseñas</Text>
                    </Pressable>
                ) : (
                    <Pressable
                        style={[
                            globalStyles.button,
                            globalStyles.button.outlineBlack,
                        ]}
                        onPress={() =>
                            setPasswordVisibility(!passwordVisibility)
                        }
                    >
                        <Text>Ocultar contraseñas</Text>
                    </Pressable>
                )}

                <Pressable
                    style={globalStyles.button}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    <Text style={{ color: '#fff' }}>
                        {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                    </Text>
                </Pressable>
            </View>
        </ProtectedRoute>
    )
}
