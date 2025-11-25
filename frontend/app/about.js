import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
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
          <Text style={styles.title}>Acerca de PyMap</Text>
          <Text style={styles.version}>Versión 1.0.0</Text>

          <Text style={styles.description}>
            PyMap es la mejor forma de encontrar negocios locales cerca de ti.
            Conectamos a vendedores y compradores de manera fácil y rápida.
          </Text>

          <View style={{ marginTop: 30, marginBottom: 20 }}>
            <Text style={[globalStyles.linkText, { textAlign: 'center', textDecorationLine: 'none', fontSize: 16 }]}>
              PyMap es tu plataforma para descubrir y conectar con negocios locales.
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

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  version: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
  },
});

