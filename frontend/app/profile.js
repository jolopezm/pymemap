import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import ProtectedRoute from '../components/protected-route';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBusiness } from '../api/business-service';
import { updateUser, deleteUser } from '../api/user-service';
import { useAuth } from '../context/auth-context';
import globalStyles from '../styles/global';

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [userId, setUserId] = useState('');
  const [isEditting, setIsEditting] = useState(false);
  const { logout, checkAuthStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setName(parsedUser.name || '');
          setEmail(parsedUser.email || '');
          setBirthdate(parsedUser.birthdate || '');
          setUserId(parsedUser._id || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchBusinesses = async () => {
      try {
        const data = await getBusiness();
        setBusinesses(data || []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };

    fetchUserData();
    fetchBusinesses();
  }, []);

  const handleEdit = () => setIsEditting(true);

  const handleSave = () => {
    setIsEditting(false);
    const body = { name, email, birthdate };
    updateUser(userId, body);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser(userId);
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <ProtectedRoute>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Perfil de usuario</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={globalStyles.textField}
          editable={isEditting}
          placeholder="Nombre"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={globalStyles.textField}
          editable={isEditting}
          placeholder="Email"
        />
        <TextInput
          value={birthdate}
          onChangeText={setBirthdate}
          style={globalStyles.textField}
          editable={isEditting}
          placeholder="Fecha de nacimiento"
        />

        <Text style={globalStyles.title}>Mis negocios:</Text>
        {businesses.length > 0 ? (
          businesses
            .filter(business => String(business.owner_id) === String(userId))
            .map(business => (
              <View key={business._id}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                  Nombre: {business.name}
                </Text>
                <Text>Dirección: {business.address}</Text>
                <Text>Categoría: {business.category}</Text>
                <Text>Descripción: {business.description}</Text>
                <Text>OwnerId: {String(business.owner_id)}</Text>
              </View>
            ))
        ) : (
          <Text>No tienes negocios registrados.</Text>
        )}

        {isEditting ? (
          <Pressable
            style={[globalStyles.button, globalStyles.button.green]}
            onPress={handleSave}
          >
            <Text style={{ color: '#000' }}>Guardar cambios</Text>
          </Pressable>
        ) : (
          <Pressable style={globalStyles.button} onPress={handleEdit}>
            <Text style={{ color: '#fff' }}>Editar datos</Text>
          </Pressable>
        )}

        <Pressable style={globalStyles.button} onPress={null}>
          <Text style={{ color: '#fff' }}>Cambiar contraseña</Text>
        </Pressable>

        <Pressable
          style={[globalStyles.button, globalStyles.button.red]}
          onPress={handleDeleteAccount}
        >
          <Text style={{ color: '#fff' }}>Eliminar cuenta</Text>
        </Pressable>

        <Link href="/home">
          <Text style={{ color: 'blue' }}>Ir a home</Text>
        </Link>
      </View>
    </ProtectedRoute>
  );
}
