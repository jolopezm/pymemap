import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    TextInput,
    Keyboard,
    Image,
} from 'react-native'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { getBusiness } from '../api/business-service'
import { StatusBar } from 'expo-status-bar'
import {
    calculateBusinessDistances,
    formatDistance,
} from '../utils/geolocation'
import { useLocation } from '../context/location-context'
import AsyncStorage from '@react-native-async-storage/async-storage'

const RECENT_SEARCHES_KEY = '@pymemap_recent_searches'
const MAX_RECENT_SEARCHES = 6

export default function SearchScreen() {
    const router = useRouter()
    const { userCoords } = useLocation()
    const [searchQuery, setSearchQuery] = useState('')
    const [businesses, setBusinesses] = useState([])
    const [recentSearches, setRecentSearches] = useState([])
    const [inputReady, setInputReady] = useState(false)
    const [nearbyFilter, setNearbyFilter] = useState(false)

    useEffect(() => {
        fetchData()
        loadRecentSearches()
        // Esperar a que la animación de fade termine antes de hacer autoFocus
        const timer = setTimeout(() => {
            setInputReady(true)
        }, 250)
        return () => clearTimeout(timer)
    }, [])

    const fetchData = async () => {
        try {
            const businessData = await getBusiness()
            setBusinesses(businessData)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    // Calcular distancias cuando cambia userCoords
    useEffect(() => {
        if (userCoords && businesses.length > 0) {
            const withDistances = calculateBusinessDistances(
                businesses,
                userCoords
            )
            setBusinesses(withDistances)
        }
    }, [userCoords])

    // Buscar en negocios y servicios
    const getSearchResults = () => {
        // Si solo está activo el filtro "Cerca de mí" sin búsqueda, mostrar negocios cercanos
        if (nearbyFilter && !searchQuery.trim() && userCoords) {
            const nearbyDistance = 3 // 3 km se considera "cerca"
            const nearbyBusinesses = businesses
                .filter(
                    business =>
                        business.distance !== undefined &&
                        business.distance <= nearbyDistance
                )
                .map(business => ({
                    type: 'business',
                    data: business,
                }))
                .sort((a, b) => a.data.distance - b.data.distance)

            return nearbyBusinesses
        }

        if (!searchQuery.trim()) return []

        const query = searchQuery.toLowerCase()
        let results = []

        // Buscar en negocios
        businesses.forEach(business => {
            const matchesName = business.name?.toLowerCase().includes(query)
            const matchesCategory = business.category
                ?.toLowerCase()
                .includes(query)
            const matchesDescription = business.description
                ?.toLowerCase()
                .includes(query)

            if (matchesName || matchesCategory || matchesDescription) {
                results.push({
                    type: 'business',
                    data: business,
                })
            }
        })

        // Aplicar filtro de cercanía si está activo (3 km - "Cerca de mí")
        if (nearbyFilter && userCoords) {
            const nearbyDistance = 3 // 3 km se considera "cerca"
            results = results.filter(result => {
                if (
                    result.type === 'business' &&
                    result.data.distance !== undefined
                ) {
                    return result.data.distance <= nearbyDistance
                }
                return true // Mantener servicios sin distancia
            })
        }

        // Ordenar por distancia si hay coordenadas
        if (userCoords) {
            results.sort((a, b) => {
                const distA = a.data.distance || Infinity
                const distB = b.data.distance || Infinity
                return distA - distB
            })
        }

        return results.slice(0, 10)
    }

    const searchResults = getSearchResults()

    // Clicks rápidos relevantes para PyMEs
    const quickClicks = [
        {
            id: 0,
            label: 'Cerca de mí',
            icon: 'location-outline',
            isNearby: true,
            maxDistance: 3,
        },
        {
            id: 1,
            label: 'Servicios',
            icon: 'construct-outline',
            searchQuery: 'servicios',
        },
        {
            id: 2,
            label: 'Belleza',
            icon: 'cut-outline',
            searchQuery: 'belleza',
        },
        { id: 3, label: 'Salud', icon: 'medkit-outline', searchQuery: 'salud' },
        {
            id: 4,
            label: 'Comida',
            icon: 'restaurant-outline',
            searchQuery: 'comida',
        },
        { id: 5, label: 'Retail', icon: 'bag-outline', searchQuery: 'retail' },
        {
            id: 6,
            label: 'Educación',
            icon: 'school-outline',
            searchQuery: 'educación',
        },
    ]

    // Cargar búsquedas recientes desde AsyncStorage
    const loadRecentSearches = async () => {
        try {
            const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY)
            if (stored) {
                setRecentSearches(JSON.parse(stored))
            }
        } catch (error) {
            console.error('Error cargando búsquedas recientes:', error)
        }
    }

    // Guardar una nueva búsqueda
    const saveRecentSearch = async query => {
        try {
            const trimmedQuery = query.trim()
            if (!trimmedQuery) return

            // Obtener búsquedas actuales
            let searches = [...recentSearches]

            // Eliminar duplicados (si ya existe, la movemos al inicio)
            searches = searches.filter(
                s => s.toLowerCase() !== trimmedQuery.toLowerCase()
            )

            // Agregar al inicio
            searches.unshift(trimmedQuery)

            // Limitar a MAX_RECENT_SEARCHES
            searches = searches.slice(0, MAX_RECENT_SEARCHES)

            // Guardar en estado y AsyncStorage
            setRecentSearches(searches)
            await AsyncStorage.setItem(
                RECENT_SEARCHES_KEY,
                JSON.stringify(searches)
            )
        } catch (error) {
            console.error('Error guardando búsqueda reciente:', error)
        }
    }

    const handleSelectResult = result => {
        // Guardar la búsqueda antes de navegar
        if (searchQuery.trim()) {
            saveRecentSearch(searchQuery)
        }

        if (result.type === 'business') {
            router.push(
                `/business-profile?id=${result.data.id || result.data._id}`
            )
        } else {
            setSearchQuery(result.data.name)
        }
    }

    const handleRecentSearch = search => {
        setSearchQuery(search)
    }

    const clearRecentSearches = async () => {
        try {
            setRecentSearches([])
            await AsyncStorage.removeItem(RECENT_SEARCHES_KEY)
        } catch (error) {
            console.error('Error eliminando búsquedas recientes:', error)
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" backgroundColor="#9B59B6" />
            {/* Header con búsqueda */}
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#888" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar negocios, servicios..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => {
                            if (searchQuery.trim()) {
                                saveRecentSearch(searchQuery)
                                Keyboard.dismiss()
                            }
                        }}
                        autoFocus={inputReady}
                        keyboardAppearance="light"
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                        selectionColor="#9B59B6"
                        cursorColor="#9B59B6"
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#888"
                            />
                        </Pressable>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {searchQuery.trim().length > 0 || nearbyFilter ? (
                    // Resultados de búsqueda
                    searchResults.length > 0 ? (
                        <View style={styles.resultsSection}>
                            {/* Contador de resultados */}
                            <View
                                style={{
                                    paddingHorizontal: 16,
                                    paddingBottom: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: '#666',
                                        fontWeight: '500',
                                    }}
                                >
                                    {searchResults.length}{' '}
                                    {searchResults.length === 1
                                        ? 'resultado'
                                        : 'resultados'}
                                    {nearbyFilter && ` cerca de ti (< 3 km)`}
                                </Text>
                                {userCoords &&
                                    searchResults.some(
                                        r => r.data.distance
                                    ) && (
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                color: '#999',
                                                marginTop: 4,
                                            }}
                                        >
                                            Las distancias son aproximadas por
                                            calles
                                        </Text>
                                    )}
                            </View>

                            {searchResults.map((result, index) => (
                                <Pressable
                                    key={`${result.type}-${result.data.id || result.data._id || index}`}
                                    style={styles.resultItem}
                                    onPress={() => handleSelectResult(result)}
                                >
                                    <View style={styles.resultIcon}>
                                        <Image
                                            source={
                                                result.type === 'business'
                                                    ? result.data.profile_pic
                                                        ? {
                                                              uri: result.data
                                                                  .profile_pic,
                                                          }
                                                        : require('../assets/default-profile-pic.svg')
                                                    : require('../assets/default-profile-pic.svg')
                                            }
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 24,
                                            }}
                                        />
                                    </View>
                                    <View style={styles.resultInfo}>
                                        <Text
                                            style={styles.resultName}
                                            numberOfLines={1}
                                        >
                                            {result.data.name}
                                        </Text>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <Text
                                                style={styles.resultCategory}
                                                numberOfLines={1}
                                            >
                                                {result.type === 'business'
                                                    ? result.data.category
                                                    : result.data.description ||
                                                      'Servicio'}
                                            </Text>
                                            {result.data.distance && (
                                                <>
                                                    <Text
                                                        style={
                                                            styles.resultCategory
                                                        }
                                                    >
                                                        •
                                                    </Text>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <Ionicons
                                                            name="location"
                                                            size={12}
                                                            color={
                                                                result.data
                                                                    .distance <
                                                                1
                                                                    ? '#4CAF50'
                                                                    : result
                                                                            .data
                                                                            .distance <
                                                                        5
                                                                      ? '#FF9800'
                                                                      : '#888'
                                                            }
                                                        />
                                                        <Text
                                                            style={{
                                                                fontSize: 12,
                                                                color:
                                                                    result.data
                                                                        .distance <
                                                                    1
                                                                        ? '#4CAF50'
                                                                        : result
                                                                                .data
                                                                                .distance <
                                                                            5
                                                                          ? '#FF9800'
                                                                          : '#888',
                                                                fontWeight:
                                                                    '600',
                                                                marginLeft: 2,
                                                            }}
                                                        >
                                                            {formatDistance(
                                                                result.data
                                                                    .distance
                                                            )}
                                                        </Text>
                                                    </View>
                                                </>
                                            )}
                                        </View>
                                    </View>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={16}
                                        color="#CCC"
                                    />
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.noResults}>
                            <Ionicons
                                name="search-outline"
                                size={48}
                                color="#CCC"
                            />
                            <Text style={styles.noResultsText}>
                                No se encontraron resultados
                            </Text>
                            <Text style={styles.noResultsSubtext}>
                                Intenta con otro término de búsqueda
                            </Text>
                        </View>
                    )
                ) : (
                    // Sugerencias cuando no hay búsqueda
                    <>
                        {/* Búsquedas recientes */}
                        {recentSearches.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionTitleContainer}>
                                        <Ionicons
                                            name="time-outline"
                                            size={18}
                                            color="#9B59B6"
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={styles.sectionTitle}>
                                            Recientes
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={clearRecentSearches}
                                        style={styles.clearButtonContainer}
                                    >
                                        <Text style={styles.clearButton}>
                                            Limpiar
                                        </Text>
                                    </Pressable>
                                </View>
                                <View style={styles.recentGrid}>
                                    {recentSearches.map((search, index) => (
                                        <Pressable
                                            key={index}
                                            style={styles.recentChip}
                                            onPress={() =>
                                                handleRecentSearch(search)
                                            }
                                        >
                                            <Text
                                                style={styles.recentChipText}
                                                numberOfLines={1}
                                            >
                                                {search}
                                            </Text>
                                            <Ionicons
                                                name="arrow-forward"
                                                size={14}
                                                color="#9B59B6"
                                            />
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Clicks rápidos */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeaderSimple}>
                                <Ionicons
                                    name="flash-outline"
                                    size={18}
                                    color="#9B59B6"
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.sectionTitle}>
                                    Explorar
                                </Text>
                            </View>
                            <View style={styles.quickGrid}>
                                {quickClicks.map(item => (
                                    <Pressable
                                        key={item.id}
                                        style={({ pressed }) => [
                                            styles.quickChip,
                                            item.isNearby &&
                                                nearbyFilter &&
                                                styles.quickChipActive,
                                            item.isNearby &&
                                                !userCoords &&
                                                styles.quickChipDisabled,
                                            pressed &&
                                                !item.isNearby &&
                                                styles.quickChipPressed,
                                        ]}
                                        onPress={() => {
                                            if (item.isNearby) {
                                                if (userCoords) {
                                                    setNearbyFilter(
                                                        !nearbyFilter
                                                    )
                                                }
                                            } else {
                                                // Buscar automáticamente con la query del botón y guardarla
                                                const query =
                                                    item.searchQuery ||
                                                    item.label
                                                setSearchQuery(query)
                                                saveRecentSearch(query)
                                            }
                                        }}
                                        disabled={item.isNearby && !userCoords}
                                    >
                                        <View
                                            style={[
                                                styles.quickIconContainer,
                                                item.isNearby &&
                                                    nearbyFilter &&
                                                    styles.quickIconContainerActive,
                                                item.isNearby &&
                                                    !userCoords &&
                                                    styles.quickIconContainerDisabled,
                                            ]}
                                        >
                                            <Ionicons
                                                name={item.icon}
                                                size={18}
                                                color={
                                                    item.isNearby &&
                                                    nearbyFilter
                                                        ? '#FFF'
                                                        : item.isNearby &&
                                                            !userCoords
                                                          ? '#CCC'
                                                          : '#9B59B6'
                                                }
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.quickText,
                                                item.isNearby &&
                                                    nearbyFilter &&
                                                    styles.quickTextActive,
                                                item.isNearby &&
                                                    !userCoords &&
                                                    styles.quickTextDisabled,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {item.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    content: {
        flex: 1,
    },

    // Secciones
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
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        letterSpacing: -0.3,
    },
    clearButtonContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#F5F0FF',
    },
    clearButton: {
        fontSize: 13,
        color: '#9B59B6',
        fontWeight: '600',
    },

    // Búsquedas recientes (estilo chips/pills)
    recentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 10,
    },
    recentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        minWidth: '48%',
        maxWidth: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    recentChipText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        flexShrink: 1,
    },

    // Sección header simple (sin botón)
    sectionHeaderSimple: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },

    // Clicks rápidos (estilo cards modernas)
    quickGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
        justifyContent: 'center',
    },
    quickChip: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        minWidth: '30%',
        maxWidth: '31%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    quickChipPressed: {
        backgroundColor: '#F5F0FF',
        borderColor: '#D4B5F7',
        transform: [{ scale: 0.98 }],
    },
    quickChipActive: {
        backgroundColor: '#9B59B6',
        borderColor: '#9B59B6',
        shadowColor: '#9B59B6',
        shadowOpacity: 0.3,
    },
    quickChipDisabled: {
        backgroundColor: '#F9F9F9',
        borderColor: '#E8E8E8',
        opacity: 0.4,
    },
    quickIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F5F0FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickIconContainerActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    quickIconContainerDisabled: {
        backgroundColor: '#F5F5F5',
    },
    quickText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0,
        marginTop: 4,
    },
    quickTextActive: {
        color: '#FFF',
    },
    quickTextDisabled: {
        color: '#CCC',
    },

    // Resultados de búsqueda
    resultsSection: {
        paddingTop: 8,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        gap: 12,
    },
    resultIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F0FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    resultCategory: {
        fontSize: 13,
        color: '#888',
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
})
