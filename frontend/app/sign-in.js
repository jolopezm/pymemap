import React, { useState } from 'react'
import {
    View,
    Text,
    Button,
    Pressable,
    TextInput,
    Platform,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { handleSignIn } from '../utils/handle-sing-in'
import { User } from '../classes/user'
import DatePicker from '../components/DatePicker'
import globalStyles from '../styles/global'

export default function SignIn() {
    const [user, setUser] = useState(new User('', '', '', '', ''))
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordVisibility, setPasswordVisibility] = useState(true)
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
                router.push('/home')
            } else {
                console.error('Datos entregados por el usuario:', {
                    rut: user.rut,
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    confirmPassword,
                    birthdate: user.birthdate,
                })
                setError(result.error)
            }
        } catch (error) {
            console.error('Error en handleSignInPress:', error)
            setError('Error al registrar usuario')
        }
    }

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Registro de usuario</Text>
            <TextInput
                placeholder="RUT"
                value={user.rut}
                onChangeText={value => updateUser('rut', value)}
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

            <DatePicker
                value={user.birthdate}
                onChange={date => updateUser('birthdate', date)}
                placeholder="Seleccionar fecha de nacimiento"
                style={globalStyles.textField}
            />

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
                    ]}
                    onPress={() => setPasswordVisibility(!passwordVisibility)}
                >
                    <Text style={{ color: '#000' }}>Ocultar contraseña</Text>
                </Pressable>
            )}

            <Pressable style={globalStyles.button} onPress={handleSignInPress}>
                <Text style={{ color: '#fff' }}>Confirmar</Text>
            </Pressable>

            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
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
