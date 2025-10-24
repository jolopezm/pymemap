import { useState } from 'react'
import {
    View,
    Text,
    Pressable,
    TextInput,
    Modal,
    ScrollView,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { handleSignIn } from '../utils/handle-sign-in'
import { User } from '../classes/user'
import globalStyles from '../styles/global'
import { Calendar } from '../components/calendar'
import { Toast } from 'toastify-react-native'
import { dateFormatter } from '../utils/date-formatter'
import { rutFormatter } from '../utils/rut-formatter'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Screen from '../components/screen'
import {
    SafeAreaView,
    SafeAreaProvider,
    initialWindowMetrics,
} from 'react-native-safe-area-context'
import { Platform } from 'react-native'
import PasswordInput from '../components/password-input'
import Button from '../components/button'
import DismissKeyboard from '../components/dismiss-keyboard'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

export default function SignIn() {
    const [user, setUser] = useState(new User('', '', '', '', ''))
    const [confirmPassword, setConfirmPassword] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const updateUser = (field, value) => {
        setUser(prevUser => ({
            ...prevUser,
            [field]: value,
        }))
    }

    const handleSignInPress = async () => {
        setError('')

        try {
            const result = await handleSignIn({
                rut: user.rut,
                name: user.name,
                email: user.email,
                password: user.password,
                confirmPassword,
                birthdate: user.birthdate,
            })

            if (result.success) {
                await AsyncStorage.setItem('authData', JSON.stringify(result))
                router.push('/auth-code')
                Toast.info('Código de verificación enviado al email', {
                    duration: 3000,
                })
            } else {
                setError(result.error)
                Toast.error(result.error || 'Error desconocido', {
                    duration: 3000,
                })
            }
        } catch (error) {
            console.error(
                'Error capturado en handleSignInPress:',
                JSON.stringify(error, null, 2)
            )
            const errorMessage =
                error.response?.data?.detail ||
                error.message || // Añadimos un fallback al mensaje del error
                'Error al registrar usuario'
            setError(errorMessage)
            Toast.error(errorMessage, { duration: 3000 })
        }
    }

    const openDateModal = () => setModalVisible(true)

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
                        {/* Icono de la app */}
                        <View style={globalStyles.logoContainer}>
                            <Ionicons
                                name="business"
                                size={64}
                                color="#FFFFFF"
                            />
                        </View>

                        {/* Título */}
                        <Text style={globalStyles.title}>¡Regístrate!</Text>

                        {/* Campo RUT */}
                        <TextInput
                            placeholder="RUT (ej: 12.345.678-9)"
                            placeholderTextColor="#999"
                            value={user.rut}
                            maxLength={12}
                            onChangeText={value =>
                                updateUser('rut', rutFormatter(value))
                            }
                            style={globalStyles.textField}
                        />

                        {/* Campo Nombre */}
                        <TextInput
                            placeholder="Nombre completo"
                            placeholderTextColor="#999"
                            value={user.name}
                            onChangeText={value => updateUser('name', value)}
                            style={globalStyles.textField}
                            autoCapitalize="words"
                        />

                        {/* Campo Email */}
                        <TextInput
                            placeholder="Correo electrónico"
                            placeholderTextColor="#999"
                            value={user.email}
                            onChangeText={value => updateUser('email', value)}
                            style={globalStyles.textField}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Campo Contraseña */}
                        <PasswordInput
                            placeholder="Contraseña"
                            value={user.password}
                            onChangeText={value =>
                                updateUser('password', value)
                            }
                            showRequirements={true}
                            onValidationChange={(isValid, requirements) => {
                                console.log(
                                    'Contraseña válida:',
                                    isValid,
                                    requirements
                                )
                            }}
                        />

                        {/* Campo Confirmar Contraseña */}
                        <PasswordInput
                            placeholder="Confirmar contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            confirmValue={user.password}
                            isConfirmField={true}
                            showToggle={true}
                            onValidationChange={(matches, data) => {
                                console.log(
                                    'Contraseñas coinciden:',
                                    matches,
                                    data
                                )
                            }}
                        />

                        {/* Campo Fecha de Nacimiento */}
                        <Pressable onPress={openDateModal}>
                            <View
                                style={[
                                    globalStyles.textField,
                                    {
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        flex: 1,
                                        fontSize: 16,
                                        color: user.birthdate ? '#333' : '#999',
                                    }}
                                >
                                    {user.birthdate || 'Fecha de nacimiento'}
                                </Text>
                                <Ionicons
                                    name="calendar"
                                    size={20}
                                    color="#999"
                                />
                            </View>
                        </Pressable>

                        {/* Botón Principal */}
                        <Button
                            title="Crear cuenta"
                            variant="primary"
                            onPress={handleSignInPress}
                            style={{ marginTop: 20, marginBottom: 10 }}
                        />

                        {/* Botón Secundario */}
                        <Text
                            style={[
                                globalStyles.linkText,
                                { marginTop: 10, marginBottom: 10 },
                            ]}
                        >
                            ¿Ya tienes cuenta?
                        </Text>
                        <Button
                            title="Iniciar sesión"
                            variant="secondary"
                            onPress={() => router.push('/login')}
                        />

                        {/* Botón de navegación al home */}
                        <Button
                            title="🏠 Explorar sin cuenta"
                            variant="outline"
                            onPress={() => router.push('/home')}
                            style={{
                                marginTop: 30,
                                borderColor: 'rgba(255, 255, 255, 0.7)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }}
                        />
                    </View>
                </ScrollView>

                {/* Modal del calendario */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    statusBarTranslucent={true}
                    visible={modalVisible}
                    presentationStyle="overFullScreen"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                        <SafeAreaView
                            style={{ flex: 1, backgroundColor: '#fff' }}
                            edges={['top', 'bottom']}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    paddingHorizontal: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Text
                                    style={[
                                        globalStyles.title,
                                        { color: '#333', marginBottom: 20 },
                                    ]}
                                >
                                    Seleccionar fecha de nacimiento
                                </Text>
                                <View style={{ alignSelf: 'stretch' }}>
                                    <Calendar
                                        selected={user.birthdate || null}
                                        onDateSelect={date =>
                                            updateUser(
                                                'birthdate',
                                                dateFormatter(date)
                                            )
                                        }
                                        style={{ width: '100%' }}
                                    />
                                </View>
                                <Button
                                    title="Seleccionar"
                                    variant="primary"
                                    onPress={() => setModalVisible(false)}
                                    style={{ marginTop: 20 }}
                                />
                                <Button
                                    title="Cerrar"
                                    variant="outline"
                                    onPress={() => setModalVisible(false)}
                                    style={{ marginTop: 10 }}
                                />
                            </View>
                        </SafeAreaView>
                    </SafeAreaProvider>
                </Modal>
            </LinearGradient>
        </DismissKeyboard>
    )
}
