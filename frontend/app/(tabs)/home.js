import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { useAuth } from '../../context/auth-context'
import { getServices, getBusiness } from '../../api/business-service'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import {
    getCurrentLocation,
    calculateBusinessDistances,
} from '../../utils/geolocation'
import LocationPickerModal from '../../components/location-picker-modal'

// Categorías de negocios PyME (más diversas y profesionales)
const CATEGORIES = [
    { id: 1, name: 'Todos', icon: 'apps-outline', color: '#9B59B6' },
    { id: 2, name: 'Comida', icon: 'restaurant-outline', color: '#FF6B6B' },
    { id: 3, name: 'Servicios', icon: 'construct-outline', color: '#4ECDC4' },
    { id: 4, name: 'Retail', icon: 'cart-outline', color: '#FFD93D' },
    { id: 5, name: 'Salud', icon: 'fitness-outline', color: '#06FFA5' },
    { id: 6, name: 'Belleza', icon: 'cut-outline', color: '#FFC2D1' },
    { id: 7, name: 'Educación', icon: 'school-outline', color: '#A8E6CF' },
    { id: 8, name: 'Hogar', icon: 'home-outline', color: '#F4A261' },
]

export default function HomeScreen() {
    const { user } = useAuth()
    const [services, setServices] = useState([])
    const [businesses, setBusinesses] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [userLocation, setUserLocation] = useState('Obteniendo ubicación...')
    const [userCoords, setUserCoords] = useState(null)
    const [isLoadingLocation, setIsLoadingLocation] = useState(true)
    const [showLocationPicker, setShowLocationPicker] = useState(false)
    const router = useRouter()
    const scrollViewRef = useRef(null)
    const nearbyStoresRef = useRef(null)

    const fetchData = async () => {
        try {
            const [servicesData, businessData] = await Promise.all([
                getServices(),
                getBusiness(),
            ])
            setServices(servicesData)
            
            console.log('📊 Negocios recibidos:', businessData.length)
            console.log('📍 Coordenadas de usuario:', userCoords)
            
            // Verificar cuántos negocios tienen coordenadas
            const withCoords = businessData.filter(b => b.latitude && b.longitude).length
            console.log(`✅ Negocios con coordenadas: ${withCoords}/${businessData.length}`)
            
            // Si tenemos coordenadas del usuario, calcular distancias
            if (userCoords) {
                const businessesWithDistance = calculateBusinessDistances(
                    businessData,
                    userCoords.latitude,
                    userCoords.longitude
                )
                console.log('📏 Distancias calculadas:', businessesWithDistance.slice(0, 3).map(b => ({
                    name: b.name,
                    distance: b.distanceText
                })))
                setBusinesses(businessesWithDistance)
            } else {
                setBusinesses(businessData)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    const fetchUserLocation = async () => {
        try {
            setIsLoadingLocation(true)
            console.log('🔄 Iniciando obtención de ubicación...')
            
            const location = await getCurrentLocation()
            
            if (location) {
                console.log('✅ Ubicación obtenida exitosamente:', location.address)
                setUserLocation(location.address)
                setUserCoords({
                    latitude: location.latitude,
                    longitude: location.longitude,
                })
            } else {
                console.warn('⚠️ No se pudo obtener ubicación')
                setUserLocation('Toca aquí para activar ubicación')
                Alert.alert(
                    'Ubicación no disponible',
                    'No pudimos obtener tu ubicación. Asegúrate de:\n\n• Tener GPS/ubicación activado\n• Dar permisos a la app\n• Estar en un lugar con buena señal',
                    [
                        { text: 'Reintentar', onPress: fetchUserLocation },
                        { text: 'Cancelar', style: 'cancel' }
                    ]
                )
            }
        } catch (error) {
            console.error('❌ Error obteniendo ubicación:', error)
            setUserLocation('Error - Toca para reintentar')
            Alert.alert(
                'Error de ubicación',
                `No pudimos obtener tu ubicación: ${error.message || 'Error desconocido'}`,
                [
                    { text: 'Reintentar', onPress: fetchUserLocation },
                    { text: 'Cancelar', style: 'cancel' }
                ]
            )
        } finally {
            setIsLoadingLocation(false)
        }
    }

    useEffect(() => {
        fetchUserLocation()
    }, [])

    useEffect(() => {
        fetchData()
    }, [userCoords])

    const handleQuickClick = category => {
        setSelectedCategory(category)
    }

    // Filtrar negocios según categoría (para el feed principal)
    const filteredBusinesses = businesses.filter(business => {
        // Si no hay categoría seleccionada o es "Todos", mostrar todos
        if (!selectedCategory || selectedCategory === 'Todos') {
            return true
        }

        // Comparar categoría del negocio con la seleccionada (case insensitive y flexible)
        const businessCategory = business.category?.toLowerCase() || ''
        const selected = selectedCategory.toLowerCase()

        // Match exacto o contenido (ej: "Comida" match con "comida rápida")
        const matchesCategory =
            businessCategory === selected || businessCategory.includes(selected)

        return matchesCategory
    })

    const scrollToNearbyStores = () => {
        // Desplazar la vista a la sección de "Cerca de ti" (React Native)
        if (nearbyStoresRef.current && scrollViewRef.current) {
            nearbyStoresRef.current.measureLayout(
                scrollViewRef.current,
                (x, y) => {
                    scrollViewRef.current.scrollTo({
                        y: y - 20,
                        animated: true,
                    })
                },
                () => console.log('Error al medir la posición')
            )
        }
    }

    // Renderizar Header con ubicación y búsqueda
    const renderHeader = () => (
        <View style={styles.header}>
            {/* Ubicación actual */}
            <Pressable
                style={styles.locationContainer}
                onPress={() => setShowLocationPicker(true)}
            >
                <View style={styles.locationIcon}>
                    {isLoadingLocation ? (
                        <ActivityIndicator size="small" color="#9B59B6" />
                    ) : (
                        <Ionicons name="location" size={20} color="#9B59B6" />
                    )}
                </View>
                <View style={styles.locationTextContainer}>
                    <Text style={styles.locationLabel}>Tu ubicación</Text>
                    <View style={styles.locationRow}>
                        <Text style={styles.locationText} numberOfLines={1}>
                            {userLocation}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={16}
                            color="#9B59B6"
                        />
                    </View>
                </View>
            </Pressable>

            {/* Barra de búsqueda compacta */}
            <Pressable
                style={styles.searchBar}
                onPress={() => router.push('/search')}
            >
                <Ionicons name="search-outline" size={20} color="#888" />
                <Text style={styles.searchPlaceholder}>
                    Buscar negocios, productos o servicios...
                </Text>
            </Pressable>
        </View>
    )

    // Renderizar Categorías (profesional para PyMEs)
    const renderCategories = () => (
        <View style={styles.categoriesSection}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
            >
                {CATEGORIES.map(category => (
                    <Pressable
                        key={category.id}
                        style={[
                            styles.categoryItem,
                            selectedCategory === category.name &&
                                styles.categoryItemActive,
                        ]}
                        onPress={() => {
                            const newCategory =
                                selectedCategory === category.name
                                    ? null
                                    : category.name
                            setSelectedCategory(newCategory)
                            // Hacer scroll después de un pequeño delay para que el estado se actualice
                            setTimeout(() => scrollToNearbyStores(), 100)
                        }}
                    >
                        <View
                            style={[
                                styles.categoryIconCircle,
                                { backgroundColor: category.color },
                                selectedCategory === category.name &&
                                    styles.categoryIconActive,
                            ]}
                        >
                            <Ionicons
                                name={category.icon}
                                size={24}
                                color="#FFF"
                            />
                        </View>
                        <Text
                            style={[
                                styles.categoryLabel,
                                selectedCategory === category.name &&
                                    styles.categoryLabelActive,
                            ]}
                        >
                            {category.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )

    // Renderizar Banner Promocional (PyMEs locales)
    const renderPromoBanner = () => (
        <View style={styles.promoSection}>
            <Pressable style={styles.promoBanner}>
                <LinearGradient
                    colors={['#9B59B6', '#8E44AD']}
                    style={styles.promoGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.promoContent}>
                        <View style={styles.promoText}>
                            <Text style={styles.promoTitle}>Apoya local</Text>
                            <Text style={styles.promoSubtitle}>
                                Descubre PyMEs cerca de ti
                            </Text>
                        </View>
                    </View>
                    <View style={styles.promoImage}>
                        <View style={styles.promoImagePlaceholder}>
                            <Ionicons
                                name="business"
                                size={48}
                                color="rgba(255,255,255,0.4)"
                            />
                        </View>
                    </View>
                </LinearGradient>
            </Pressable>
        </View>
    )

    // Renderizar Negocios Destacados (círculos con badges)
    const renderFeaturedBrands = () => {
        const featured = businesses.slice(0, 6)

        if (featured.length === 0) return null

        return (
            <View style={styles.brandsSection}>
                <Text style={styles.sectionTitle}>Destacados en tu zona</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.brandsScroll}
                >
                    {featured.map((business, index) => (
                        <Pressable
                            key={business.id || business._id || index}
                            style={styles.brandCircle}
                            onPress={() =>
                                router.push(
                                    `/business-profile?id=${business.id || business._id}`
                                )
                            }
                        >
                            <LinearGradient
                                colors={['#F5F5F5', '#E8E8E8']}
                                style={styles.brandLogo}
                            >
                                <Ionicons
                                    name="storefront"
                                    size={32}
                                    color="#9B59B6"
                                />
                            </LinearGradient>
                            <Text style={styles.brandName} numberOfLines={1}>
                                {business.name}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        )
    }

    // Renderizar "Nuevos en PymeMap"
    const renderNewBusinesses = () => {
        const newBusinesses = businesses.slice(0, 3)

        if (newBusinesses.length === 0) return null

        return (
            <View style={styles.newSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Nuevos en PymeMap</Text>
                    <Pressable>
                        <Text style={styles.seeMore}>Ver más</Text>
                    </Pressable>
                </View>
                <Text style={styles.sectionSubtitle}>
                    Conoce los negocios que se unieron recientemente
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.newScroll}
                    snapToInterval={240}
                    decelerationRate="fast"
                >
                    {newBusinesses.map((business, index) => (
                        <Pressable
                            key={business.id || business._id || index}
                            style={styles.newCard}
                            onPress={() =>
                                router.push(
                                    `/business-profile?id=${business.id || business._id}`
                                )
                            }
                        >
                            {/* Badge "Nuevo" */}
                            <View style={styles.newBadge}>
                                <Ionicons
                                    name="sparkles"
                                    size={12}
                                    color="#9B59B6"
                                />
                                <Text style={styles.newBadgeText}>Nuevo</Text>
                            </View>

                            {/* Imagen del negocio */}
                            <View style={styles.newImageContainer}>
                                <LinearGradient
                                    colors={['#F0F0F0', '#E0E0E0']}
                                    style={styles.newImagePlaceholder}
                                >
                                    {business.profile_pic ? (
                                        <Image
                                            source={{
                                                uri: business.profile_pic,
                                            }}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Ionicons
                                            name="storefront"
                                            size={50}
                                            color="#9B59B6"
                                        />
                                    )}
                                </LinearGradient>
                            </View>

                            {/* Info del negocio */}
                            <View style={styles.newInfo}>
                                <Text style={styles.newName} numberOfLines={1}>
                                    {business.name}
                                </Text>
                                <Text
                                    style={styles.newCategory}
                                    numberOfLines={1}
                                >
                                    {business.category || 'General'}
                                </Text>
                                <View style={styles.newMeta}>
                                    <View style={styles.newRating}>
                                        <Ionicons
                                            name="star"
                                            size={12}
                                            color="#FFB800"
                                        />
                                        <Text style={styles.newRatingText}>
                                            Nuevo
                                        </Text>
                                    </View>
                                    <View style={styles.newDistance}>
                                        <Ionicons
                                            name="location"
                                            size={12}
                                            color="#666"
                                        />
                                        <Text style={styles.newDistanceText}>
                                            {business.distanceText || 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        )
    }

    // Renderizar Negocios Cercanos (lista vertical)
    const renderNearbyStores = () => {
        const displayBusinesses = selectedCategory
            ? filteredBusinesses
            : businesses

        return (
            <View ref={nearbyStoresRef} style={styles.hotSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Cerca de ti</Text>
                </View>
                {displayBusinesses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="business-outline"
                            size={64}
                            color="#DDD"
                        />
                        <Text style={styles.emptyText}>
                            No se encontraron negocios
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Intenta buscar en otra ubicación
                        </Text>
                    </View>
                ) : (
                    <View style={styles.hotList}>
                        {displayBusinesses.map((business, index) => (
                            <Pressable
                                key={business.id || business._id || index}
                                style={styles.hotCard}
                                onPress={() =>
                                    router.push(
                                        `/business-profile?id=${business.id || business._id}`
                                    )
                                }
                            >
                                {/* Imagen del negocio */}
                                <View style={styles.hotImageContainer}>
                                    <LinearGradient
                                        colors={['#F5F5F5', '#EBEBEB']}
                                        style={styles.hotImagePlaceholder}
                                    >
                                        {business.profile_pic ? (
                                            <Image
                                                source={{
                                                    uri: business.profile_pic,
                                                }}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Ionicons
                                                name="storefront"
                                                size={40}
                                                color="#9B59B6"
                                            />
                                        )}
                                    </LinearGradient>
                                </View>

                                {/* Info del negocio */}
                                <View style={styles.hotInfo}>
                                    <Text
                                        style={styles.hotName}
                                        numberOfLines={1}
                                    >
                                        {business.name}
                                    </Text>
                                    <Text
                                        style={styles.hotCategory}
                                        numberOfLines={1}
                                    >
                                        {business.category || 'General'}
                                    </Text>
                                    <View style={styles.hotFooter}>
                                        <View style={styles.hotRating}>
                                            <Ionicons
                                                name="star"
                                                size={14}
                                                color="#FFB800"
                                            />
                                            <Text style={styles.hotRatingText}>
                                                4.{5 + (index % 4)}
                                            </Text>
                                            <Text style={styles.hotReviews}>
                                                (50+)
                                            </Text>
                                        </View>
                                        <View style={styles.hotDistance}>
                                            <Ionicons
                                                name="location"
                                                size={12}
                                                color="#9B59B6"
                                            />
                                            <Text
                                                style={styles.hotDistanceText}
                                            >
                                                {business.distanceText || 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
        )
    }

    const handleLocationSelected = location => {
        setUserLocation(location.address)
        setUserCoords({
            latitude: location.latitude,
            longitude: location.longitude,
        })
        // Recalcular distancias con la nueva ubicación
        fetchData()
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" backgroundColor="#9B59B6" />
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]}
            >
                {renderHeader()}
                {renderCategories()}
                {renderPromoBanner()}
                {renderFeaturedBrands()}
                {renderNewBusinesses()}
                {renderNearbyStores()}
            </ScrollView>

            {/* Modal para cambiar ubicación */}
            <LocationPickerModal
                visible={showLocationPicker}
                onClose={() => setShowLocationPicker(false)}
                onLocationSelected={handleLocationSelected}
                currentAddress={userLocation}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },

    // Header con ubicación
    header: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationIcon: {
        marginRight: 8,
    },
    locationTextContainer: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 11,
        color: '#888',
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginRight: 4,
        maxWidth: '90%',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: 14,
        color: '#999',
    },

    // Categorías (profesional para PyMEs)
    categoriesSection: {
        backgroundColor: '#FFF',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    categoriesScroll: {
        paddingHorizontal: 12,
        gap: 12,
    },
    categoryItem: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    categoryIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryIconActive: {
        transform: [{ scale: 1.1 }],
        shadowOpacity: 0.2,
        elevation: 6,
    },
    categoryLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
    },
    categoryLabelActive: {
        color: '#9B59B6',
        fontWeight: '700',
    },

    // Banner Promocional (PyMEs)
    promoSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    promoBanner: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    promoGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        minHeight: 120,
    },
    promoContent: {
        flex: 1,
    },
    promoText: {
        flex: 1,
    },
    promoTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 6,
    },
    promoSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.95)',
        fontWeight: '500',
    },
    promoImage: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    promoImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Destacados (círculos)
    brandsSection: {
        backgroundColor: '#FFF',
        paddingVertical: 16,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    brandsScroll: {
        paddingHorizontal: 12,
        gap: 16,
    },
    brandCircle: {
        alignItems: 'center',
        width: 80,
    },
    brandLogo: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 8,
    },
    brandName: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        textAlign: 'center',
    },

    // Lo más nuevo
    newSection: {
        backgroundColor: '#FFF',
        paddingTop: 16,
        paddingBottom: 20,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    seeMore: {
        fontSize: 13,
        color: '#9B59B6',
        fontWeight: '600',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#888',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    newScroll: {
        paddingHorizontal: 12,
        gap: 12,
    },
    newCard: {
        width: 220,
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    newBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    newBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9B59B6',
    },
    newImageContainer: {
        width: '100%',
        height: 140,
    },
    newImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    newInfo: {
        padding: 12,
    },
    newName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    newCategory: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
    },
    newMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    newRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    newRatingText: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
    },
    newDistance: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    newDistanceText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },

    // Negocios Cercanos (lista vertical)
    hotSection: {
        backgroundColor: '#FFF',
        paddingTop: 16,
        paddingBottom: 80,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    hotList: {
        paddingHorizontal: 16,
    },
    hotCard: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    hotImageContainer: {
        width: 100,
        height: 100,
    },
    hotImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hotInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    hotName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    hotCategory: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
    },
    hotFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    hotRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    hotRatingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    hotReviews: {
        fontSize: 12,
        color: '#888',
    },
    hotDistance: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    hotDistanceText: {
        fontSize: 12,
        color: '#9B59B6',
        fontWeight: '600',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#AAA',
        marginTop: 8,
    },
})
