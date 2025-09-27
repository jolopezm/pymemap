import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';
import globalStyles from '../styles/global';
import Screen from '../components/screen'

export default function About() {
  return (
    <Screen>
      <Text style={globalStyles.title} >Sobre nosotros</Text>
      <Link href="/home" asChild>
        <Button title="Go to Home" />
      </Link>
    </Screen>
  );
}

