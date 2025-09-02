import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';
import globalStyles from '../styles/global';

export default function About() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title} >Sobre nosotros</Text>
      <Link href="/home" asChild>
        <Button title="Go to Home" />
      </Link>
    </View>
  );
}

