import React, { useState } from 'react'
import { View, Text, Pressable, TextInput, Modal } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { handleSignIn } from '../utils/handle-sing-in'
import { User } from '../classes/user'
import globalStyles from '../styles/global'
import { Calendar } from '../components/calendar'
import { Toast } from 'toastify-react-native'
import { dateFormatter } from '../utils/date-formatter'
import { rutFormatter } from '../utils/rut-formatter'
import { sendAuthCode } from '../api/auth-service' // Asegúrate de tener esta función

export default function SignIn() {
    const [user, setUser] = useState(new User('', '', '', '', ''))
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordVisibility, setPasswordVisibility] = useState(true)
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

            // Asumiendo que el registro fue exitoso
            if (result.success) {
                // Enviamos el código de autenticación
                await sendAuthCode(user.email)

                // Redirigimos a la página del código, pasando el email y la contraseña
                router.push({
                    pathname: '/auth-code',
                    params: { email: user.email, password: user.password },
                })
            } else {
                setError(result.error)
                Toast.error(error, { duration: 3000 })
            }
        } catch (error) {
            setError('Error al registrar usuario')
            Toast.error(error, { duration: 3000 })
        }
    }

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Registro de usuario</Text>
            <TextInput
                placeholder="RUT"
                value={user.rut}
                maxLength={12}
                onChangeText={value => updateUser('rut', rutFormatter(value))}
                style={globalStyles.textField}
            />

            <TextInput
                placeholder="Nombre"
                value={user.name}
                onChangeText={value => updateUser('name', value)}
                style={globalStyles.textField}
            />
            <TextInput
                placeholder="Email"
                value={user.email}
                onChangeText={value => updateUser('email', value)}
                style={globalStyles.textField}
            />

            {passwordVisibility ? (
                <View>
                    <TextInput
                        placeholder="Contraseña"
                        value={user.password}
                        onChangeText={value => updateUser('password', value)}
                        style={globalStyles.textField}
                        secureTextEntry
                    />
                    <TextInput
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={globalStyles.textField}
                        secureTextEntry
                    />
                </View>
            ) : (
                <View>
                    <TextInput
                        placeholder="Contraseña"
                        value={user.password}
                        onChangeText={value => updateUser('password', value)}
                        style={globalStyles.textField}
                    />
                    <TextInput
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={globalStyles.textField}
                    />
                </View>
            )}

            <Pressable onPress={() => setModalVisible(true)}>
                <TextInput
                    placeholder="Fecha de nacimiento (DD/MM/YYYY)"
                    value={user.birthdate}
                    style={globalStyles.textField}
                    editable={false}
                    pointerEvents="none"
                />
            </Pressable>

            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible)
                }}
            >
                <View style={globalStyles.container}>
                    <Text style={globalStyles.title}>
                        Seleccionar fecha de nacimiento
                    </Text>
                    <Calendar
                        selected={user.birthdate || null}
                        onDateSelect={date =>
                            updateUser('birthdate', dateFormatter(date))
                        }
                    />
                    <Pressable
                        style={globalStyles.button}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={{ color: '#fff' }}>Seleccionar</Text>
                    </Pressable>
                    <Pressable
                        style={[globalStyles.button, globalStyles.button.red]}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={{ color: '#fff' }}>Cerrar</Text>
                    </Pressable>
                </View>
            </Modal>

            {passwordVisibility ? (
                <Pressable
                    style={globalStyles.button}
                    onPress={() => setPasswordVisibility(!passwordVisibility)}
                >
                    <Text style={{ color: '#fff' }}>Ver contraseña</Text>
                </Pressable>
            ) : (
                <Pressable
                    style={[
                        globalStyles.button,
                        globalStyles.button.outlineBlack,
                        {
                            color: '#000',
                        },
                    ]}
                    onPress={() => setPasswordVisibility(!passwordVisibility)}
                >
                    <Text>Ocultar contraseña</Text>
                </Pressable>
            )}

            <Pressable style={globalStyles.button} onPress={handleSignInPress}>
                <Text style={{ color: '#fff' }}>Confirmar</Text>
            </Pressable>

            <Text style={{ marginTop: 10 }}>¿Ya estás registrado?</Text>
            <Pressable
                style={globalStyles.button}
                onPress={() => router.push('/login')}
            >
                <Text style={{ color: '#fff' }}>Ir a inicio de sesión</Text>
            </Pressable>

            <Link href="/home">
                <Text style={{ color: 'blue' }}>Ir a home</Text>
            </Link>
        </View>
    )
}
