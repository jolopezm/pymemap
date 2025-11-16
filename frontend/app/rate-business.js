import React from 'react'
import {
    View,
    Text,
    Pressable,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { globalStyles, colors } from '../styles/global'
import { useAuth } from '../context/auth-context'
import { getBusiness } from '../api/business-service'
import LoadingSpinner from '../components/loading-spinner'
import Screen from '../components/screen'
import DefaultModal from '../components/default-modal'
import { createReview } from '../api/review-service'

export default function RateBusiness() {
    const { businessId } = useLocalSearchParams()
    const router = useRouter()
    const { user } = useAuth()

    const [business, setBusiness] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [rating, setRating] = React.useState(0)
    const [comment, setComment] = React.useState('')
    const [modalVisible, setModalVisible] = React.useState(false)

    React.useEffect(() => {
        const fetchBusiness = async () => {
            if (!businessId) {
                setLoading(false)
                return
            }

            try {
                const foundBusiness = await getBusiness(businessId)
                setBusiness(foundBusiness)
            } catch (error) {
                console.error('Error fetching business:', error)
                Alert.alert('Error', 'No se pudo cargar el negocio')
            } finally {
                setLoading(false)
            }
        }

        fetchBusiness()
    }, [businessId])

    const handleStarPress = star => {
        setRating(star)
    }

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert(
                'Calificación requerida',
                'Por favor selecciona una calificación de 1 a 5 estrellas'
            )
            return
        }

        if (!comment.trim()) {
            Alert.alert(
                'Opinión requerida',
                'Por favor escribe tu opinión sobre el negocio'
            )
            return
        }

        await saveReview()

        // Mostrar modal de confirmación
        setModalVisible(true)
    }

    const handleGoHome = () => {
        setModalVisible(false)
        router.push('/(tabs)/home')
    }

    const saveReview = async () => {
        try {
            await createReview({
                businessId: businessId,
                userId: user?.id || user?._id,
                userName: user?.name || 'Usuario anónimo',
                rating: rating,
                comment: comment.trim(),
                date: new Date().toISOString(),
            })
        } catch (error) {
            console.error('Error saving review:', error)
        }
    }

    if (loading) {
        return (
            <LinearGradient
                colors={['#9B59B6', '#F8BBD9']}
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={globalStyles.gradientContainer}>
                    <LoadingSpinner />
                </View>
            </LinearGradient>
        )
    }

    if (!business) {
        return (
            <LinearGradient
                colors={['#9B59B6', '#F8BBD9']}
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={globalStyles.gradientContainer}>
                    <Ionicons name="alert-circle" size={64} color="#FFFFFF" />
                    <Text style={[globalStyles.title, { marginTop: 20 }]}>
                        Negocio no encontrado
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
                        style={{ marginTop: 20 }}
                    >
                        <Text style={globalStyles.linkText}>Volver</Text>
                    </Pressable>
                </View>
            </LinearGradient>
        )
    }

    return (
        <Screen>
            <ScrollView>
                <View style={styles.container}>
                    {/* Header */}
                    <Ionicons
                        name="star"
                        size={64}
                        color="#FFD700"
                        style={{ alignSelf: 'center', marginBottom: 16 }}
                    />

                    <Text style={[globalStyles.title, { textAlign: 'center' }]}>
                        Califica tu experiencia
                    </Text>

                    <Text
                        style={[
                            globalStyles.subtitle,
                            { textAlign: 'center', marginBottom: 24 },
                        ]}
                    >
                        {business.name}
                    </Text>

                    {/* Rating Stars */}
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Pressable
                                key={star}
                                onPress={() => handleStarPress(star)}
                                style={styles.starButton}
                            >
                                <Ionicons
                                    name={
                                        star <= rating ? 'star' : 'star-outline'
                                    }
                                    size={48}
                                    color={
                                        star <= rating ? '#FFD700' : '#CCCCCC'
                                    }
                                />
                            </Pressable>
                        ))}
                    </View>

                    {rating > 0 && (
                        <Text style={styles.ratingText}>
                            {rating === 1 && '⭐ Malo'}
                            {rating === 2 && '⭐⭐ Regular'}
                            {rating === 3 && '⭐⭐⭐ Bueno'}
                            {rating === 4 && '⭐⭐⭐⭐ Muy bueno'}
                            {rating === 5 && '⭐⭐⭐⭐⭐ Excelente'}
                        </Text>
                    )}

                    {/* Comment Section */}
                    <Text style={[globalStyles.subtitle, { marginTop: 24 }]}>
                        Cuéntanos tu experiencia
                    </Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Escribe tu opinión sobre este negocio..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={6}
                        maxLength={500}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />
                    <Text style={styles.characterCount}>
                        {comment.length}/500 caracteres
                    </Text>

                    {/* Submit Button */}
                    <Pressable
                        style={[
                            globalStyles.button,
                            {
                                opacity:
                                    rating === 0 || !comment.trim() ? 0.5 : 1,
                                marginTop: 24,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            },
                        ]}
                        onPress={handleSubmit}
                        disabled={rating === 0 || !comment.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color="#fff"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={globalStyles.buttonText}>
                            Enviar reseña
                        </Text>
                    </Pressable>

                    {/* Cancel Button */}
                    <Pressable
                        style={[styles.cancelButton]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Success Modal */}
            {modalVisible && (
                <DefaultModal
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <Ionicons
                        name="checkmark-circle"
                        size={64}
                        color="#4CAF50"
                        style={{ alignSelf: 'center', marginBottom: 16 }}
                    />
                    <Text style={[globalStyles.title, { textAlign: 'center' }]}>
                        ¡Gracias por tu reseña!
                    </Text>
                    <Text
                        style={[
                            globalStyles.subtitle,
                            { textAlign: 'center', marginBottom: 24 },
                        ]}
                    >
                        Tu opinión nos ayuda a mejorar
                    </Text>
                    <Pressable
                        style={globalStyles.button}
                        onPress={handleGoHome}
                    >
                        <Text style={globalStyles.buttonText}>
                            Volver al inicio
                        </Text>
                    </Pressable>
                </DefaultModal>
            )}
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        gap: 8,
    },
    starButton: {
        padding: 4,
    },
    ratingText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 8,
    },
    commentInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        minHeight: 150,
    },
    characterCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
})
