import React, { useState } from 'react';
import { View, Text, Button, Pressable, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

      <View style={{ position: 'relative', width: '100%', alignItems: 'center' }}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={[globalStyles.textField, { paddingRight: 40 }]}
          secureTextEntry={!passwordVisibility}
        />
        <Pressable
          onPress={() => setPasswordVisibility(!passwordVisibility)}
          style={{
            position: 'absolute',
            right: '25%',
            top: '50%',
            transform: [{ translateY: -12 }],
            padding: 5
          }}
        >
          <Ionicons 
            name={passwordVisibility ? 'eye' : 'eye-off'} 
            size={24} 
            color="black"
          />
        </Pressable>
      </View>
      
      <View style={{ position: 'relative', width: '100%', alignItems: 'center' }}>
        <TextInput
          placeholder="Enter your password again"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[globalStyles.textField, { paddingRight: 40 }]}
          secureTextEntry={!passwordVisibility}
        />
        <Pressable
          onPress={() => setPasswordVisibility(!passwordVisibility)}
          style={{
            position: 'absolute',
            right: '25%',
            top: '50%',
            transform: [{ translateY: -12 }],
            padding: 5
          }}
        >
          <Ionicons 
            name={passwordVisibility ? 'eye' : 'eye-off'} 
            size={24} 
            color="black"
          />
        </Pressable>
      </View>

      <TextInput
        placeholder="Birthdate"
        value={birthdate}
        onChangeText={setBirthdate}
        style={globalStyles.textField}
      />



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
