import React, { useState } from 'react';
import { View, Text, Button, Pressable, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createUser } from '../api/user-service';
import globalStyles from '../styles/global';

export default function SignIn() {
  const [rut, setRut] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = () => {
    if (
      !rut ||
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !birthdate
    ) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    createUser({ rut, name, email, password, birthdate })
      .then(response => {
        router.push('/home');
        console.log('Usuario creado:', response);
      })
      .catch(err => {
        setError('Error al crear usuario');
      });
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Registro de usuario</Text>
      <TextInput
        placeholder="RUT"
        value={rut}
        onChangeText={setRut}
        style={globalStyles.textField}
      />

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={globalStyles.textField}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={globalStyles.textField}
      />

      {passwordVisibility ? (
        <View>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={globalStyles.textField}
            secureTextEntry
          />
          <TextInput
            placeholder="Enter your password again"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={globalStyles.textField}
            secureTextEntry
          />
        </View>
      ) : (
        <View>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={globalStyles.textField}
          />
          <TextInput
            placeholder="Enter your password again"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={globalStyles.textField}
          />
        </View>
      )}

      <TextInput
        placeholder="Birthdate"
        value={birthdate}
        onChangeText={setBirthdate}
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
          style={[globalStyles.button, globalStyles.button.outlineBlack]}
          onPress={() => setPasswordVisibility(!passwordVisibility)}
        >
          <Text style={{ color: '#000' }}>Ocultar contraseña</Text>
        </Pressable>
      )}

      <Pressable style={globalStyles.button} onPress={handleSignIn}>
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
  );
}
