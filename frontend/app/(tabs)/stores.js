import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Image, Modal, Animated, Dimensions } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { getServices, getBusiness } from '../../api/business-service'
import { calculateBusinessDistances, formatDistance } from '../../utils/geolocation'
import { useLocation } from '../../context/location-context'
import LocationPickerModal from '../../components/location-picker-modal'
import MapView, { Marker } from 'react-native-maps'

const CARD_WIDTH = Dimensions.get('window').width * 0.7 // 70% del ancho de pantalla
const CARD_PADDING = 16

export default function StoresScreen() {
    const router = useRouter()
    const { userLocation, userCoords, updateLocation } = useLocation()
    const [allBusinesses, setAllBusinesses] = useState([]) // Todos los negocios sin filtrar
    const [businesses, setBusinesses] = useState([]) // Negocios filtrados y ordenados
    const [activeView, setActiveView] = useState('list') // 'list' o 'map'
    const [locationModalVisible, setLocationModalVisible] = useState(false)
    const [selectedMapBusiness, setSelectedMapBusiness] = useState(null) // Negocio seleccionado en el mapa
    const mapRef = useRef(null) // Referencia al mapa
    const scrollViewRef = useRef(null) // Referencia al ScrollView de cards
    const [mapRegion, setMapRegion] = useState(null) // Región visible del mapa
    const [selectedFilters, setSelectedFilters] = useState({
        domicilio: false,
        categories: [],
        recoger: false,
        distance: null, // null, 1, 3, 5, 10 (km)
    })
    const [showSortModal, setShowSortModal] = useState(false)
    const [showCategoriesModal, setShowCategoriesModal] = useState(false)
    const [sortOption, setSortOption] = useState('Recomendados')
    const slideAnim = useRef(new Animated.Value(300)).current
    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        fetchData()
    }, [])

    const handleLocationSelected = async (coords) => {
        // Actualizar ubicación en el contexto global
        updateLocation(coords, coords.address || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`)
        setLocationModalVisible(false)
        
        // Recalcular distancias con la nueva ubicación
        if (allBusinesses.length > 0) {
            const withDistances = calculateBusinessDistances(allBusinesses, coords)
            setAllBusinesses(withDistances)
        }
    }

    useEffect(() => {
        if (showSortModal) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 20,
                    bounciness: 0,
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 300,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [showSortModal])

    const fetchData = async () => {
        try {
            const businessData = await getBusiness()
            
            // Calcular distancias si hay ubicación del usuario
            if (userCoords) {
                const withDistances = calculateBusinessDistances(businessData, userCoords)
                setAllBusinesses(withDistances)
            } else {
                setAllBusinesses(businessData)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    // Recalcular distancias cuando cambia userCoords
    useEffect(() => {
        if (userCoords && allBusinesses.length > 0) {
            const withDistances = calculateBusinessDistances(allBusinesses, userCoords)
            setAllBusinesses(withDistances)
        }
    }, [userCoords])

    // Aplicar filtros y ordenamiento cuando cambian
    useEffect(() => {
        let filtered = getFilteredBusinesses()
        let sorted = applySorting(filtered)
        setBusinesses(sorted)
    }, [allBusinesses, selectedFilters, sortOption])

    // Función para filtrar negocios
    const getFilteredBusinesses = () => {
        let filtered = [...allBusinesses]

        // Filtrar por domicilio
        if (selectedFilters.domicilio) {
            filtered = filtered.filter(business => business.hasDelivery !== false)
        }

        // Filtrar por recoger en tienda
        if (selectedFilters.recoger) {
            filtered = filtered.filter(business => business.hasPickup !== false)
        }

        // Filtrar por categorías
        if (selectedFilters.categories.length > 0) {
            filtered = filtered.filter(business => 
                selectedFilters.categories.some(cat => 
                    business.category?.toLowerCase().includes(cat.toLowerCase())
                )
            )
        }

        // Filtrar por distancia (solo si el negocio tiene coordenadas Y distancia calculada)
        if (selectedFilters.distance && userCoords) {
            console.log(`🔍 Filtrando por distancia: < ${selectedFilters.distance} km`)
            const before = filtered.length
            filtered = filtered.filter(business => {
                const hasDistance = business.distance !== undefined && business.distance !== null
                const withinRange = hasDistance && business.distance <= selectedFilters.distance
                
                if (hasDistance && !withinRange) {
                    console.log(`❌ ${business.name}: ${business.distance.toFixed(2)} km (fuera de rango)`)
                }
                
                return withinRange
            })
            console.log(`📊 Filtrados: ${before} → ${filtered.length} negocios dentro de ${selectedFilters.distance} km`)
        }

        return filtered
    }

    // Función para aplicar ordenamiento
    const applySorting = (businessList) => {
        let sorted = [...businessList]
        
        switch(sortOption) {
            case 'Más cercanos':
                if (userCoords) {
                    sorted.sort((a, b) => {
                        const distA = a.distance !== undefined ? a.distance : Infinity
                        const distB = b.distance !== undefined ? b.distance : Infinity
                        return distA - distB
                    })
                }
                break
            case 'Mejor calificados':
                sorted.sort((a, b) => {
                    const ratingA = 4.5 + Math.random() * 0.5
                    const ratingB = 4.5 + Math.random() * 0.5
                    return ratingB - ratingA
                })
                break
            case 'Más populares':
                sorted.sort(() => Math.random() - 0.5)
                break
            case 'Nuevos':
                sorted.reverse()
                break
            case 'Recomendados':
            default:
                if (userCoords) {
                    sorted.sort((a, b) => {
                        const distA = a.distance !== undefined ? a.distance : Infinity
                        const distB = b.distance !== undefined ? b.distance : Infinity
                        return distA - distB
                    })
                }
                break
        }
        
        return sorted
    }

    const handleSelectBusiness = (business) => {
        router.push(`/business-profile?id=${business.id || business._id}`)
    }

    // Manejar clic en marcador del mapa
    const handleMarkerPress = (business) => {
        setSelectedMapBusiness(business)
        // Encontrar el índice de la card y hacer scroll
        const businessesWithCoords = businesses.filter(b => b.latitude && b.longitude)
        const index = businessesWithCoords.findIndex(b => (b.id && b.id === business.id) || (b._id && b._id === business._id))
        
        if (index !== -1 && scrollViewRef.current) {
            // Calcular posición exacta: (ancho de card + gap) * índice
            const scrollX = index * (CARD_WIDTH + 12)
            scrollViewRef.current.scrollTo({ x: scrollX, animated: true })
        }
    }

    // Centrar mapa en un negocio específico
    const centerMapOnBusiness = (business) => {
        if (mapRef.current && business.latitude && business.longitude) {
            mapRef.current.animateToRegion({
                latitude: business.latitude,
                longitude: business.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500)
        }
    }

    // Ajustar mapa para mostrar todos los marcadores
    const fitMapToMarkers = () => {
        if (!mapRef.current || !userCoords) return
        
        const businessesWithCoords = businesses.filter(b => b.latitude && b.longitude)
        if (businessesWithCoords.length === 0) return

        // Calcular bounds
        const lats = [...businessesWithCoords.map(b => b.latitude), userCoords.latitude]
        const lons = [...businessesWithCoords.map(b => b.longitude), userCoords.longitude]
        
        const minLat = Math.min(...lats)
        const maxLat = Math.max(...lats)
        const minLon = Math.min(...lons)
        const maxLon = Math.max(...lons)
        
        const centerLat = (minLat + maxLat) / 2
        const centerLon = (minLon + maxLon) / 2
        const latDelta = (maxLat - minLat) * 1.3 // 30% padding
        const lonDelta = (maxLon - minLon) * 1.3
        
        mapRef.current.animateToRegion({
            latitude: centerLat,
            longitude: centerLon,
            latitudeDelta: Math.max(latDelta, 0.02), // Mínimo zoom
            longitudeDelta: Math.max(lonDelta, 0.02),
        }, 500)
    }

    // Ajustar mapa cuando cambian los negocios filtrados
    useEffect(() => {
        if (activeView === 'map' && businesses.length > 0) {
            // Pequeño delay para que el mapa esté renderizado
            setTimeout(() => fitMapToMarkers(), 300)
        }
    }, [businesses, activeView])

    const handleSortSelect = (option) => {
        setSortOption(option)
        setShowSortModal(false)
    }

    const sortOptions = [
        { id: 1, label: 'Recomendados', icon: 'star-outline' },
        { id: 2, label: 'Más cercanos', icon: 'location-outline' },
        { id: 3, label: 'Mejor calificados', icon: 'trophy-outline' },
        { id: 4, label: 'Más populares', icon: 'trending-up-outline' },
        { id: 5, label: 'Nuevos', icon: 'sparkles-outline' },
    ]

    const categoryOptions = [
        { id: 1, label: 'Comida', icon: 'fast-food-outline' },
        { id: 2, label: 'Servicios', icon: 'construct-outline' },
        { id: 3, label: 'Retail', icon: 'bag-outline' },
        { id: 4, label: 'Salud', icon: 'medkit-outline' },
        { id: 5, label: 'Belleza', icon: 'cut-outline' },
        { id: 6, label: 'Educación', icon: 'school-outline' },
        { id: 7, label: 'Hogar', icon: 'home-outline' },
        { id: 8, label: 'Tecnología', icon: 'phone-portrait-outline' },
    ]

    const handleCategoryToggle = (category) => {
        setSelectedFilters(prev => {
            const currentCategories = prev.categories
            const isSelected = currentCategories.includes(category)
            
            return {
                ...prev,
                categories: isSelected 
                    ? currentCategories.filter(c => c !== category)
                    : [...currentCategories, category]
            }
        })
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header con ubicación y búsqueda */}
            <View style={styles.header}>
                {/* Ubicación actual */}
                <Pressable style={styles.locationContainer} onPress={() => setLocationModalVisible(true)}>
                    <View style={styles.locationIcon}>
                        <Ionicons name="location" size={20} color="#9B59B6" />
                    </View>
                    <View style={styles.locationTextContainer}>
                        <Text style={styles.locationLabel}>Tu ubicación</Text>
                        <View style={styles.locationRow}>
                            <Text style={styles.locationText} numberOfLines={1}>
                                {userLocation}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#333" />
                        </View>
                    </View>
                </Pressable>

                {/* Barra de búsqueda compacta */}
                <Pressable 
                    style={styles.searchBar}
                    onPress={() => router.push('/search')}
                >
                    <Ionicons name="search-outline" size={20} color="#888" />
                    <Text style={styles.searchPlaceholder}>Buscar negocios o servicios</Text>
                </Pressable>
            </View>

            {/* Tabs: Mapa / Lista */}
            <View style={styles.tabsContainer}>
                <Pressable 
                    style={[styles.tab, activeView === 'map' && styles.tabActive]}
                    onPress={() => setActiveView('map')}
                >
                    <Text style={[styles.tabText, activeView === 'map' && styles.tabTextActive]}>
                        Mapa
                    </Text>
                </Pressable>
                <Pressable 
                    style={[styles.tab, activeView === 'list' && styles.tabActive]}
                    onPress={() => setActiveView('list')}
                >
                    <Text style={[styles.tabText, activeView === 'list' && styles.tabTextActive]}>
                        Lista
                    </Text>
                </Pressable>
            </View>

            {/* Filtros rápidos */}
            <View style={styles.filtersContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScroll}
                >
                    <Pressable 
                        style={styles.filterChip}
                        onPress={() => setShowSortModal(true)}
                    >
                        <Ionicons name="swap-vertical-outline" size={14} color="#333" />
                        <Text style={styles.filterText}>Ordenar</Text>
                    </Pressable>

                    <Pressable 
                        style={[styles.filterChip, selectedFilters.categories.length > 0 && styles.filterChipActive]}
                        onPress={() => setShowCategoriesModal(true)}
                    >
                        <Ionicons name="grid-outline" size={14} color={selectedFilters.categories.length > 0 ? '#FFF' : '#333'} />
                        <Text style={[styles.filterText, selectedFilters.categories.length > 0 && styles.filterTextActive]}>
                            Categorías {selectedFilters.categories.length > 0 && `${selectedFilters.categories.length}`}
                        </Text>
                    </Pressable>

                    <Pressable 
                        style={[styles.filterChip, selectedFilters.recoger && styles.filterChipActive]}
                        onPress={() => setSelectedFilters(prev => ({ ...prev, recoger: !prev.recoger }))}
                    >
                        <Ionicons name="bag-handle-outline" size={14} color={selectedFilters.recoger ? '#FFF' : '#333'} />
                        <Text style={[styles.filterText, selectedFilters.recoger && styles.filterTextActive]}>
                            Recoger en tienda
                        </Text>
                    </Pressable>

                    <Pressable 
                        style={[styles.filterChip, selectedFilters.domicilio && styles.filterChipActive]}
                        onPress={() => setSelectedFilters(prev => ({ ...prev, domicilio: !prev.domicilio }))}
                    >
                        <Ionicons name="car-outline" size={14} color={selectedFilters.domicilio ? '#FFF' : '#333'} />
                        <Text style={[styles.filterText, selectedFilters.domicilio && styles.filterTextActive]}>
                            Domicilio
                        </Text>
                    </Pressable>

                    {userCoords && (
                        <>
                            <Pressable 
                                style={[styles.filterChip, selectedFilters.distance === 1 && styles.filterChipActive]}
                                onPress={() => {
                                    const newDistance = selectedFilters.distance === 1 ? null : 1
                                    console.log('🔘 Filtro distancia: < 1 km', newDistance ? 'ACTIVADO' : 'DESACTIVADO')
                                    setSelectedFilters(prev => ({ ...prev, distance: newDistance }))
                                }}
                            >
                                <Ionicons name="navigate-outline" size={14} color={selectedFilters.distance === 1 ? '#FFF' : '#333'} />
                                <Text style={[styles.filterText, selectedFilters.distance === 1 && styles.filterTextActive]}>
                                    Menos de 1 km
                                </Text>
                            </Pressable>

                            <Pressable 
                                style={[styles.filterChip, selectedFilters.distance === 3 && styles.filterChipActive]}
                                onPress={() => {
                                    const newDistance = selectedFilters.distance === 3 ? null : 3
                                    console.log('🔘 Filtro distancia: < 3 km', newDistance ? 'ACTIVADO' : 'DESACTIVADO')
                                    setSelectedFilters(prev => ({ ...prev, distance: newDistance }))
                                }}
                            >
                                <Ionicons name="navigate-outline" size={14} color={selectedFilters.distance === 3 ? '#FFF' : '#333'} />
                                <Text style={[styles.filterText, selectedFilters.distance === 3 && styles.filterTextActive]}>
                                    Menos de 3 km
                                </Text>
                            </Pressable>

                            <Pressable 
                                style={[styles.filterChip, selectedFilters.distance === 5 && styles.filterChipActive]}
                                onPress={() => {
                                    const newDistance = selectedFilters.distance === 5 ? null : 5
                                    console.log('🔘 Filtro distancia: < 5 km', newDistance ? 'ACTIVADO' : 'DESACTIVADO')
                                    setSelectedFilters(prev => ({ ...prev, distance: newDistance }))
                                }}
                            >
                                <Ionicons name="navigate-outline" size={14} color={selectedFilters.distance === 5 ? '#FFF' : '#333'} />
                                <Text style={[styles.filterText, selectedFilters.distance === 5 && styles.filterTextActive]}>
                                    Menos de 5 km
                                </Text>
                            </Pressable>
                        </>
                    )}
                </ScrollView>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {activeView === 'list' ? (
                    <View style={styles.resultsContainer}>
                        {businesses.length > 0 ? (
                            <>
                                {/* Contador de resultados */}
                                <View style={{ paddingBottom: 12 }}>
                                    <Text style={{ fontSize: 14, color: '#666', fontWeight: '500' }}>
                                        {businesses.length} {businesses.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}
                                        {selectedFilters.distance && ` a menos de ${selectedFilters.distance} km`}
                                    </Text>
                                    {userCoords && businesses.some(b => b.distance) && (
                                        <Text style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                                            {selectedFilters.distance 
                                                ? 'Mostrando solo negocios con ubicación. Distancias aproximadas por calles.'
                                                : 'Las distancias son aproximadas por calles'}
                                        </Text>
                                    )}
                                </View>
                                
                                {businesses.map((business, index) => (
                            <Pressable
                                key={business.id || business._id || index}
                                style={styles.businessCard}
                                onPress={() => handleSelectBusiness(business)}
                            >
                                {/* Badge de disponibilidad */}
                                <View style={styles.stockBadge}>
                                    <Text style={styles.stockText}>Disponible</Text>
                                </View>

                                {/* Botón de favoritos */}
                                <Pressable style={styles.favoriteButton}>
                                    <Ionicons name="heart-outline" size={20} color="#333" />
                                </Pressable>

                                {/* Imagen del negocio */}
                                <View style={styles.businessImage}>
                                    {business.profile_pic ? (
                                        <Image
                                            source={{ uri: business.profile_pic }}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Ionicons name="storefront" size={50} color="#9B59B6" />
                                    )}
                                </View>

                                {/* Info del negocio */}
                                <View style={styles.businessInfo}>
                                    <Text style={styles.businessName} numberOfLines={1}>
                                        {business.name}
                                    </Text>
                                    <Text style={styles.businessCategory}>
                                        {business.category || 'Servicios generales'}
                                    </Text>
                                    <View style={styles.businessMeta}>
                                        <View style={styles.rating}>
                                            <Ionicons name="star" size={14} color="#FFB800" />
                                            <Text style={styles.ratingText}>4.{5 + (index % 5)}</Text>
                                            <Text style={styles.reviewsText}>({20 + (index * 5)} reseñas)</Text>
                                        </View>
                                    </View>
                                    <View style={styles.businessFooter}>
                                        <View style={styles.infoItem}>
                                            <Ionicons name="time-outline" size={14} color="#9B59B6" />
                                            <Text style={styles.infoText}>Abierto hoy</Text>
                                        </View>
                                        {business.distance !== undefined && (
                                            <View style={styles.infoItem}>
                                                <Ionicons 
                                                    name="location-outline" 
                                                    size={14} 
                                                    color={business.distance < 1 ? '#4CAF50' : business.distance < 5 ? '#FF9800' : '#9B59B6'} 
                                                />
                                                <Text style={[
                                                    styles.infoText,
                                                    { color: business.distance < 1 ? '#4CAF50' : business.distance < 5 ? '#FF9800' : '#666' }
                                                ]}>
                                                    {formatDistance(business.distance)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Logo circular */}
                                <View style={styles.businessLogo}>
                                    <LinearGradient
                                        colors={['#9B59B6', '#8E44AD']}
                                        style={styles.logoCircle}
                                    >
                                        <Text style={styles.logoText}>
                                            {business.name.substring(0, 2).toUpperCase()}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </Pressable>
                                ))}
                            </>
                        ) : (
                            <View style={styles.noResults}>
                                <Ionicons name="storefront-outline" size={48} color="#CCC" />
                                <Text style={styles.noResultsText}>
                                    {selectedFilters.distance 
                                        ? `No hay negocios a menos de ${selectedFilters.distance} km`
                                        : selectedFilters.categories.length > 0
                                        ? 'No hay negocios con estas categorías'
                                        : 'No hay tiendas disponibles'}
                                </Text>
                                {selectedFilters.distance && (
                                    <Pressable 
                                        style={{ marginTop: 12, padding: 8 }}
                                        onPress={() => setSelectedFilters(prev => ({ ...prev, distance: null }))}
                                    >
                                        <Text style={{ color: '#9B59B6', fontWeight: '600' }}>
                                            Quitar filtro de distancia
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                        )}
                    </View>
                ) : (
                    // Vista de Mapa
                    <View style={styles.mapContainer}>
                        {userCoords && businesses.length > 0 ? (
                            <>
                                {/* Mapa interactivo con React Native Maps */}
                                <MapView
                                    ref={mapRef}
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: userCoords.latitude,
                                        longitude: userCoords.longitude,
                                        latitudeDelta: 0.05,
                                        longitudeDelta: 0.05,
                                    }}
                                    showsUserLocation={true}
                                    showsMyLocationButton={true}
                                    onRegionChangeComplete={(region) => setMapRegion(region)}
                                >
                                    {/* Marcadores de negocios - pins púrpura */}
                                    {businesses.filter(b => b.latitude && b.longitude).map((business) => {
                                        const lat = parseFloat(business.latitude)
                                        const lng = parseFloat(business.longitude)
                                        
                                        return (
                                            <Marker
                                                key={business.id || business._id}
                                                coordinate={{
                                                    latitude: lat,
                                                    longitude: lng
                                                }}
                                                title={business.name}
                                                description={business.category}
                                                onPress={() => handleMarkerPress(business)}
                                                pinColor="#9B59B6"
                                            />
                                        )
                                    })}
                                </MapView>

                                {/* Cards rediseñadas - estilo visual grande */}
                                <View style={styles.mapCardsContainer}>
                                    <ScrollView 
                                        ref={scrollViewRef}
                                        horizontal 
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.mapCardsScroll}
                                        snapToInterval={CARD_WIDTH + 12}
                                        decelerationRate="fast"
                                        snapToAlignment="start"
                                    >
                                        {businesses.filter(b => b.latitude && b.longitude).map((business, index) => {
                                            // Comparar usando el ID que exista (_id de MongoDB o id)
                                            const businessId = business._id || business.id
                                            const selectedId = selectedMapBusiness?._id || selectedMapBusiness?.id
                                            const isSelected = selectedMapBusiness !== null && businessId === selectedId
                                            
                                            return (
                                                <Pressable
                                                    key={business.id || business._id || index}
                                                    style={[
                                                        styles.mapCard,
                                                        isSelected && styles.mapCardSelected
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedMapBusiness(business)
                                                        centerMapOnBusiness(business)
                                                    }}
                                                >
                                                    {/* Imagen compacta */}
                                                    <View style={styles.mapCardImageLarge}>
                                                        {business.profile_pic ? (
                                                            <Image
                                                                source={{ uri: business.profile_pic }}
                                                                style={styles.mapCardImageFull}
                                                                resizeMode="cover"
                                                            />
                                                        ) : (
                                                            <LinearGradient
                                                                colors={['#F5F0FF', '#E8D5FF']}
                                                                style={styles.mapCardImageFull}
                                                            >
                                                                <Ionicons name="storefront-outline" size={36} color="#9B59B6" />
                                                            </LinearGradient>
                                                        )}
                                                        
                                                        {/* Badge de distancia */}
                                                        {business.distance !== undefined && (
                                                            <View style={styles.distanceBadge}>
                                                                <Ionicons name="location" size={10} color="#FFF" />
                                                                <Text style={styles.distanceBadgeText}>
                                                                    {formatDistance(business.distance)}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    {/* Info del negocio */}
                                                    <View style={styles.mapCardContent}>
                                                        <Text style={styles.mapCardTitle} numberOfLines={1}>
                                                            {business.name}
                                                        </Text>
                                                        <View style={styles.mapCardFooter}>
                                                            <View style={styles.mapCardMeta}>
                                                                <Ionicons name="star" size={12} color="#FFB800" />
                                                                <Text style={styles.mapCardRating}>4.{5 + (index % 5)}</Text>
                                                                <Text style={styles.mapCardCategory}>• {business.category || 'Servicios'}</Text>
                                                            </View>
                                                            <Pressable onPress={() => handleSelectBusiness(business)}>
                                                                <Ionicons name="chevron-forward-circle" size={24} color="#9B59B6" />
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                                </Pressable>
                                            )
                                        })}
                                    </ScrollView>
                                </View>
                            </>
                        ) : (
                            // Placeholder cuando no hay ubicación o negocios
                            <View style={styles.mapPlaceholder}>
                                <LinearGradient
                                    colors={['#E8E8E8', '#F5F5F5']}
                                    style={styles.mapGradient}
                                >
                                    <View style={styles.centerMarker}>
                                        <Ionicons name="location-outline" size={48} color="#999" />
                                    </View>
                                    <View style={styles.mapInfo}>
                                        <Text style={styles.mapInfoText}>
                                            {!userCoords 
                                                ? 'Habilita tu ubicación para ver el mapa'
                                                : businesses.length === 0
                                                ? 'No hay negocios para mostrar'
                                                : `${businesses.filter(b => !b.latitude || !b.longitude).length} negocios sin coordenadas`}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Modal de ordenar */}
            <Modal
                visible={showSortModal}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowSortModal(false)}
            >
                <Animated.View 
                    style={[
                        styles.modalOverlay,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Pressable 
                        style={styles.modalOverlayTouchable}
                        onPress={() => setShowSortModal(false)}
                    />
                    <Animated.View 
                        style={[
                            styles.modalContent,
                            { transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ordenar por</Text>
                            <Pressable onPress={() => setShowSortModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </Pressable>
                        </View>

                        <View style={styles.sortOptions}>
                            {sortOptions.map((option) => (
                                <Pressable
                                    key={option.id}
                                    style={[
                                        styles.sortOption,
                                        sortOption === option.label && styles.sortOptionActive
                                    ]}
                                    onPress={() => handleSortSelect(option.label)}
                                >
                                    <View style={styles.sortOptionContent}>
                                        <Ionicons 
                                            name={option.icon} 
                                            size={20} 
                                            color={sortOption === option.label ? '#9B59B6' : '#666'} 
                                        />
                                        <Text style={[
                                            styles.sortOptionText,
                                            sortOption === option.label && styles.sortOptionTextActive
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </View>
                                    {sortOption === option.label && (
                                        <Ionicons name="checkmark" size={24} color="#9B59B6" />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Modal de categorías */}
            <Modal
                visible={showCategoriesModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCategoriesModal(false)}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setShowCategoriesModal(false)}
                >
                    <Pressable 
                        style={styles.modalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Categorías</Text>
                            <Pressable onPress={() => setShowCategoriesModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.categoryOptions}>
                            {categoryOptions.map((category) => (
                                <Pressable
                                    key={category.id}
                                    style={[
                                        styles.categoryOption,
                                        selectedFilters.categories.includes(category.label) && styles.categoryOptionActive
                                    ]}
                                    onPress={() => handleCategoryToggle(category.label)}
                                >
                                    <View style={styles.categoryOptionContent}>
                                        <Ionicons 
                                            name={category.icon} 
                                            size={20} 
                                            color={selectedFilters.categories.includes(category.label) ? '#9B59B6' : '#666'} 
                                        />
                                        <Text style={[
                                            styles.categoryOptionText,
                                            selectedFilters.categories.includes(category.label) && styles.categoryOptionTextActive
                                        ]}>
                                            {category.label}
                                        </Text>
                                    </View>
                                    {selectedFilters.categories.includes(category.label) && (
                                        <Ionicons name="checkmark" size={24} color="#9B59B6" />
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Pressable 
                                style={styles.clearButton}
                                onPress={() => setSelectedFilters(prev => ({ ...prev, categories: [] }))}
                            >
                                <Text style={styles.clearButtonText}>Limpiar</Text>
                            </Pressable>
                            <Pressable 
                                style={styles.applyButton}
                                onPress={() => setShowCategoriesModal(false)}
                            >
                                <Text style={styles.applyButtonText}>Aplicar</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Modal de cambiar ubicación */}
            <LocationPickerModal
                visible={locationModalVisible}
                onClose={() => setLocationModalVisible(false)}
                onLocationSelected={handleLocationSelected}
                currentLocation={userCoords}
            />
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
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

    // Tabs Mapa/Lista
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 3,
        borderBottomColor: '#9B59B6',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#999',
    },
    tabTextActive: {
        color: '#9B59B6',
    },

    // Filtros
    filtersContainer: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filtersScroll: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 6,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        gap: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
    },
    filterChipActive: {
        backgroundColor: '#9B59B6',
        borderColor: '#9B59B6',
    },
    filterText: {
        fontSize: 11,
        color: '#333',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#FFF',
    },

    content: {
        flex: 1,
    },

    // Secciones de sugerencias
    section: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    clearButton: {
        fontSize: 13,
        color: '#E91E63',
        fontWeight: '600',
    },

    // Búsquedas recientes
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    recentText: {
        fontSize: 15,
        color: '#333',
    },

    // Marcas y clicks rápidos
    brandsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
    },
    brandChip: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    brandText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    quickGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
    },
    quickChip: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    quickText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },

    // Resultados en formato card
    resultsContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 80,
    },
    businessCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'visible',
    },
    stockBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#9B59B6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 2,
    },
    stockText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    businessImage: {
        width: '100%',
        height: 140,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    businessInfo: {
        padding: 12,
    },
    businessName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    businessCategory: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9B59B6',
        marginBottom: 8,
    },
    businessMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    reviewsText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 4,
    },
    businessFooter: {
        flexDirection: 'row',
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#666',
    },
    businessLogo: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 60,
        height: 60,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    logoCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    logoText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },

    // Sin resultados
    noResults: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    noResultsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 4,
    },
    noResultsSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },

    // Modal de ordenar
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalOverlayTouchable: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    sortOptions: {
        paddingTop: 8,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    sortOptionActive: {
        backgroundColor: '#F9F5FC',
    },
    sortOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sortOptionText: {
        fontSize: 16,
        color: '#333',
    },
    sortOptionTextActive: {
        fontWeight: '600',
        color: '#9B59B6',
    },

    // Modal de categorías
    categoryOptions: {
        maxHeight: 400,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    categoryOptionActive: {
        backgroundColor: '#F9F5FC',
    },
    categoryOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    categoryOptionText: {
        fontSize: 16,
        color: '#333',
    },
    categoryOptionTextActive: {
        fontWeight: '600',
        color: '#9B59B6',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    clearButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#9B59B6',
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9B59B6',
    },
    applyButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#9B59B6',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },

    // Vista de Mapa
    mapContainer: {
        flex: 1,
        height: '100%',
        minHeight: 600,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapPlaceholder: {
        flex: 1,
        height: '100%',
    },
    mapGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    centerMarker: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    markerPulse: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(155, 89, 182, 0.2)',
        zIndex: 0,
    },
    mapInfo: {
        position: 'absolute',
        bottom: 180,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mapInfoText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },

    // Cards de negocios en el mapa
    mapCardsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        paddingBottom: 16,
    },
    mapCardsScroll: {
        paddingHorizontal: CARD_PADDING,
        gap: 12,
    },

    // Cards compactas
    mapCard: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    mapCardSelected: {
        borderWidth: 3,
        borderColor: '#9B59B6',
        shadowColor: '#9B59B6',
        shadowOpacity: 0.4,
    },
    mapCardImageLarge: {
        width: '100%',
        height: 100, // Reducido de 140 a 100
        position: 'relative',
    },
    mapCardImageFull: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    distanceBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(155, 89, 182, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    distanceBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
    },
    mapCardContent: {
        padding: 12,
    },
    mapCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    mapCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mapCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    mapCardRating: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    mapCardCategory: {
        fontSize: 12,
        color: '#888',
        flex: 1,
    },
})

