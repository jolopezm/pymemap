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
import { globalStyles, colors } from '../styles/theme'
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
import Button from '../components/ui/Button'
import DismissKeyboard from '../components/dismiss-keyboard'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import logger from '../utils/logger'

export default function SignIn() {
    const [user, setUser] = useState(new User('', '', '', '', ''))
    const [confirmPassword, setConfirmPassword] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [error, setError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [rutError, setRutError] = useState('')
    const router = useRouter()

    const updateUser = (field, value) => {
        setUser(prevUser => ({
            ...prevUser,
            [field]: value,
        }))
    }

    const handleSignInPress = async () => {
        setError('')
        setEmailError('')
        setRutError('')

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(user.email)) {
            setEmailError('Por favor ingresa un correo electrónico válido')
            return
        }

        const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/
        if (!rutRegex.test(user.rut)) {
            setRutError('RUT inválido. Formato: 12.345.678-9')
            return
        }

        if (!user.name.trim()) {
            setError('El nombre es obligatorio')
            return
        }

        if (user.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres')
            return
        }

        if (user.password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (!user.birthdate) {
            setError('La fecha de nacimiento es obligatoria')
            return
        }

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
                Toast.success('Código de verificación enviado al email', {
                    duration: 3000,
                })
            } else {
                setError(result.error)
            }
        } catch (error) {
            logger.error(
                'Error capturado en handleSignInPress:',
                JSON.stringify(error, null, 2)
            )
            const errorMessage =
                error.response?.data?.detail ||
                error.message ||
                'Error al registrar usuario'
            setError(errorMessage)
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
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View
                            style={[
                                globalStyles.gradientContainer,
                                { paddingVertical: 20 },
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

                            {/* Subtítulo */}
                            <Text style={globalStyles.subtitle}>
                                Crea tu cuenta y empieza a descubrir
                            </Text>

                            {/* Mensaje de error general */}
                            {error ? (
                                <View
                                    style={{
                                        backgroundColor:
                                            'rgba(255, 59, 48, 0.15)',
                                        borderLeftWidth: 4,
                                        borderLeftColor: '#FF3B30',
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        borderRadius: 12,
                                        marginBottom: 16,
                                        width: '100%',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#FFFFFF',
                                            fontSize: 14,
                                            fontWeight: '600',
                                        }}
                                    >
                                        ⚠️ {error}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Campo RUT */}
                            <TextInput
                                placeholder="RUT (ej: 12.345.678-9)"
                                placeholderTextColor="#999"
                                value={user.rut}
                                maxLength={12}
                                onChangeText={value => {
                                    const cleaned = value
                                        .replace(/[^0-9kK]/g, '')
                                        .toUpperCase()

                                    let valid = cleaned

                                    const kIndex = cleaned.indexOf('K')
                                    if (kIndex !== -1) {
                                        if (
                                            kIndex !== cleaned.length - 1 ||
                                            cleaned.split('K').length > 2
                                        ) {
                                            setRutError(
                                                'La letra K solo puede ir al final del RUT'
                                            )
                                            return // No actualizar el valor
                                        }
                                        if (cleaned.length < 2) {
                                            setRutError(
                                                'Ingresa primero los números del RUT'
                                            )
                                            return
                                        }
                                    }

                                    setRutError('')
                                    updateUser('rut', rutFormatter(valid))
                                }}
                                style={[
                                    globalStyles.textField,
                                    rutError && {
                                        borderWidth: 2,
                                        borderColor: '#FF3B30',
                                    },
                                ]}
                                keyboardType="default"
                                autoCapitalize="characters"
                            />
                            {rutError ? (
                                <Text
                                    style={{
                                        color: '#FFFFFF',
                                        fontSize: 13,
                                        marginTop: -10,
                                        marginBottom: 10,
                                        marginLeft: 4,
                                        fontWeight: '500',
                                    }}
                                >
                                    {rutError}
                                </Text>
                            ) : null}

                            {/* Campo Nombre */}
                            <TextInput
                                placeholder="Nombre completo"
                                placeholderTextColor="#999"
                                value={user.name}
                                onChangeText={value =>
                                    updateUser('name', value)
                                }
                                style={globalStyles.textField}
                                autoCapitalize="words"
                            />

                            {/* Campo Email */}
                            <TextInput
                                placeholder="Correo electrónico"
                                placeholderTextColor="#999"
                                value={user.email}
                                onChangeText={value => {
                                    updateUser('email', value)
                                    setEmailError('')
                                }}
                                style={[
                                    globalStyles.textField,
                                    emailError && {
                                        borderWidth: 2,
                                        borderColor: '#FF3B30',
                                    },
                                ]}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {emailError ? (
                                <Text
                                    style={{
                                        color: '#FFFFFF',
                                        fontSize: 13,
                                        marginTop: -10,
                                        marginBottom: 10,
                                        marginLeft: 4,
                                        fontWeight: '500',
                                    }}
                                >
                                    {emailError}
                                </Text>
                            ) : null}

                            {/* Campo Contraseña */}
                            <PasswordInput
                                placeholder="Contraseña"
                                value={user.password}
                                onChangeText={value =>
                                    updateUser('password', value)
                                }
                                showRequirements={true}
                            />

                            {/* Campo Confirmar Contraseña */}
                            <PasswordInput
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                confirmValue={user.password}
                                isConfirmField={true}
                                showToggle={true}
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
                                            color: user.birthdate
                                                ? '#333'
                                                : '#999',
                                        }}
                                    >
                                        {user.birthdate ||
                                            'Fecha de nacimiento'}
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
                                disabled={
                                    !user.rut ||
                                    !user.name ||
                                    !user.email ||
                                    !user.password ||
                                    !confirmPassword ||
                                    !user.birthdate
                                }
                                style={{ marginTop: 16, marginBottom: 24 }}
                            />

                            {/* Divider */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 20,
                                    width: '100%',
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        height: 1,
                                        backgroundColor:
                                            'rgba(255, 255, 255, 0.3)',
                                    }}
                                />
                                <Text
                                    style={{
                                        marginHorizontal: 15,
                                        color: '#FFFFFF',
                                        fontSize: 14,
                                        fontWeight: '500',
                                        opacity: 0.85,
                                    }}
                                >
                                    ¿Ya tienes cuenta?
                                </Text>
                                <View
                                    style={{
                                        flex: 1,
                                        height: 1,
                                        backgroundColor:
                                            'rgba(255, 255, 255, 0.3)',
                                    }}
                                />
                            </View>

                            {/* Botón Secundario */}
                            <Button
                                title="Iniciar sesión"
                                variant="secondary"
                                onPress={() => router.push('/login')}
                                style={{ marginBottom: 12 }}
                            />

                            {/* Botón de navegación al home */}
                            <Pressable
                                onPress={() => router.push('/(tabs)/home')}
                                style={({ pressed }) => ({
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 14,
                                    marginTop: 12,
                                    opacity: pressed ? 0.7 : 1,
                                })}
                            >
                                <Ionicons
                                    name="compass-outline"
                                    size={20}
                                    color="#FFFFFF"
                                    style={{ marginRight: 8 }}
                                />
                                <Text
                                    style={{
                                        color: '#FFFFFF',
                                        fontSize: 15,
                                        fontWeight: '600',
                                        opacity: 0.9,
                                    }}
                                >
                                    Explorar sin cuenta
                                </Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </SafeAreaView>

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
