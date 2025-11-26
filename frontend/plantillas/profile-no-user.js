import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { globalStyles, colors } from '../styles/theme'
import Button from '../components/ui/Button'
import BenefitItem from '../components/benefit-item';
import React from 'react';


export default function ProfileNoUser() {
    const router = useRouter();

    return (
        <LinearGradient
            colors={['#9B59B6', '#F8BBD9']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 30,
                        paddingTop: 10,
                        paddingBottom: 20,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Icono principal */}
                    <View
                        style={[
                            globalStyles.logoContainer,
                            { marginBottom: 14, marginTop: 5 },
                        ]}
                    >
                        <Ionicons
                            name="person-circle"
                            size={64}
                            color="#FFFFFF"
                        />
                    </View>

                    {/* Título */}
                    <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 10, fontSize: 26 }]}>
                        ¡Únete a PyMap!
                    </Text>

                    {/* Subtítulo */}
                    <Text
                        style={[
                            globalStyles.subtitle,
                            { marginBottom: 18, textAlign: 'center', fontSize: 14 },
                        ]}
                    >
                        Crea tu cuenta y accede a todas las funciones
                    </Text>
                    {/* Lista de beneficios */}
                    <View style={{ width: '100%', marginBottom: 18 }}>
                        <BenefitItem
                            icon="business"
                            text="Gestiona tus negocios"
                        />
                        <BenefitItem
                            icon="wallet"
                            text="Pagos seguros"
                        />
                        <BenefitItem
                            icon="time"
                            text="Historial de servicios"
                        />
                        <BenefitItem
                            icon="star"
                            text="Y mucho más"
                        />
                    </View>

                    {/* Botones */}
                    <View style={{ width: '100%' }}>
                        <Button
                            title="Crear cuenta"
                            variant="primary"
                            onPress={() => router.push('/sign-in')}
                            size="medium"
                            style={{ marginBottom: 10, minHeight: 48 }}
                        />

                        <Button
                            title="Iniciar sesión"
                            variant="secondary"
                            onPress={() => router.push('/login')}
                            size="medium"
                            style={{ marginBottom: 14, minHeight: 48, borderWidth: 2 }}
                        />

                        {/* Link mejorado para continuar sin cuenta */}
                        <Pressable
                            onPress={() => router.push('/(tabs)/home')}
                            style={({ pressed }) => ({
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 14,
                                marginTop: 8,
                                opacity: pressed ? 0.7 : 1,
                            })}
                        >
                            <Ionicons
                                name="compass-outline"
                                size={20}
                                color="#FFFFFF"
                                style={{ marginRight: 8 }}
                            />
                            <Text
                                style={{
                                    color: '#FFFFFF',
                                    fontSize: 15,
                                    fontWeight: '600',
                                    opacity: 0.9,
                                }}
                            >
                                Explorar sin cuenta
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}