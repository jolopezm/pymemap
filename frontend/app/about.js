import { View, Text } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { globalStyles, colors } from '../styles/theme'
import Button from '../components/ui/Button'
import DismissKeyboard from '../components/dismiss-keyboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function About() {
  const router = useRouter();

  return (
    <DismissKeyboard>
      <LinearGradient
        colors={['#9B59B6', '#F8BBD9']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={globalStyles.gradientContainer}>
          {/* Icono de la app */}
          <View style={globalStyles.logoContainer}>
            <Ionicons name="information-circle" size={64} color="#FFFFFF" />
          </View>

          {/* Título */}
          <Text style={globalStyles.title}>Sobre PymeMap</Text>

          {/* Contenido */}
          <Text style={globalStyles.subtitle}>
            Encuentra los mejores negocios y servicios cerca de ti
          </Text>

          <View style={{ marginTop: 30, marginBottom: 20 }}>
            <Text style={[globalStyles.linkText, { textAlign: 'center', textDecorationLine: 'none', fontSize: 16 }]}>
              PymeMap es tu plataforma para descubrir y conectar con negocios locales. 
              Nuestra misión es facilitar la búsqueda de servicios y productos en tu área.
            </Text>
          </View>

          {/* Botón de regreso */}
          <Button
            title="🏠 Volver al inicio"
            variant="primary"
            onPress={() => router.push('/home')}
            style={{ marginTop: 20 }}
          />
        </View>
      </LinearGradient>
    </DismissKeyboard>
  );
}

