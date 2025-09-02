import React, { useState } from 'react';
import { View, Text, Button, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../context/auth-context';
import globalStyles from '../styles/global';

export default function Login({title, onPress}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    // Validaciones
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Login exitoso - redirigir al inicio
        Alert.alert('Éxito', 'Inicio de sesión exitoso');
        router.push('/home');
      } else {
        // Mostrar error
        setError(result.error);
      }
    } catch (error) {
      console.error('Error durante login:', error);
      setError('Error al iniciar sesión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Iniciar Sesión</Text>

      <TextInput 
        placeholder="Email"
        style={globalStyles.textField}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput 
        placeholder="Password"
        style={globalStyles.textField}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Pressable style={globalStyles.button} onPress={handleLogin}>
          <Text style={{ color: '#fff' }}>Confirmar</Text>
        </Pressable>
      )}

      <Text style={{ marginTop: 20 }}>¿No tienes cuenta?</Text> 
      <Pressable style={globalStyles.button} onPress={() => router.push('/sign-in')}>
        <Text style={{ color: '#fff' }}>Registrarse</Text>
      </Pressable>

      <Link href="/home">
        <Text style={{ color: 'blue'}}>Ir a home</Text>
      </Link>
    </View>
  );
}

