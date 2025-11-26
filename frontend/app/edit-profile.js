import { View, TextInput, Text, Pressable } from 'react-native'
import { globalStyles, colors } from '../styles/theme'
import Screen from '../components/screen'
import React from 'react'
import { updateUser } from '../api/user-service'
import { useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'

export default function EditProfile() {
    const [name, setName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [birthdate, setBirthdate] = React.useState('')
    const router = useRouter()
    const { user } = useAuth()

    const handleSave = () => {
        setIsEditting(false)
        const body = { name, email, birthdate }
        updateUser(user._id, body)
    }

    return (
        <Screen>
            <View>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    style={globalStyles.textField}
                    placeholder={user.name}
                />
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    style={globalStyles.textField}
                    placeholder={user.email}
                />
                <TextInput
                    value={birthdate}
                    onChangeText={setBirthdate}
                    style={globalStyles.textField}
                    placeholder={user.birthdate}
                />
            </View>

            <Pressable
                style={[globalStyles.button, globalStyles.button.green]}
                onPress={handleSave}
            >
                <Text style={{ color: '#000' }}>Guardar cambios</Text>
            </Pressable>

            <Pressable
                style={globalStyles.button}
                onPress={() => router.push('/change-password')}
            >
                <Text style={{ color: '#fff' }}>Cambiar contraseña</Text>
            </Pressable>
        </Screen>
    )
}
