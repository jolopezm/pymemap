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
import { getServices, getBusiness } from '../api/business-service'
import { StatusBar } from 'expo-status-bar'

export default function SearchScreen() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [services, setServices] = useState([])
    const [businesses, setBusinesses] = useState([])
    const [recentSearches, setRecentSearches] = useState([]) // Vacío por defecto
    const [inputReady, setInputReady] = useState(false)

    useEffect(() => {
        fetchData()
        // Esperar a que la animación de fade termine antes de hacer autoFocus
        const timer = setTimeout(() => {
            setInputReady(true)
        }, 250)
        return () => clearTimeout(timer)
    }, [])

    const fetchData = async () => {
        try {
            const [servicesData, businessData] = await Promise.all([
                getServices(),
                getBusiness(),
            ])
            setServices(servicesData)
            setBusinesses(businessData)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    // Buscar en negocios y servicios
    const getSearchResults = () => {
        if (!searchQuery.trim()) return []

        const query = searchQuery.toLowerCase()
        const results = []

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

        // Buscar en servicios
        services.forEach(service => {
            const matchesName = service.name?.toLowerCase().includes(query)
            const matchesDescription = service.description
                ?.toLowerCase()
                .includes(query)

            if (matchesName || matchesDescription) {
                results.push({
                    type: 'service',
                    data: service,
                })
            }
        })

        return results.slice(0, 10)
    }

    const searchResults = getSearchResults()

    // Marcas más buscadas (top 6 negocios)
    const topBrands = businesses.slice(0, 6)

    // Clicks rápidos relevantes para PyMEs
    const quickClicks = [
        { id: 1, label: 'Servicios técnicos', icon: 'construct-outline' },
        { id: 2, label: 'Belleza y estética', icon: 'cut-outline' },
        { id: 3, label: 'Salud', icon: 'medkit-outline' },
        { id: 4, label: 'Comida', icon: 'restaurant-outline' },
        { id: 5, label: 'Retail', icon: 'bag-outline' },
        { id: 6, label: 'Educación', icon: 'school-outline' },
    ]

    const handleSelectResult = result => {
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

    const clearRecentSearches = () => {
        setRecentSearches([])
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
                {searchQuery.trim().length > 0 ? (
                    // Resultados de búsqueda
                    searchResults.length > 0 ? (
                        <View style={styles.resultsSection}>
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
                                        <Text
                                            style={styles.resultCategory}
                                            numberOfLines={1}
                                        >
                                            {result.type === 'business'
                                                ? result.data.category
                                                : result.data.description ||
                                                  'Servicio'}
                                        </Text>
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
                                    <Text style={styles.sectionTitle}>
                                        Búsquedas recientes
                                    </Text>
                                    <Pressable onPress={clearRecentSearches}>
                                        <Text style={styles.clearButton}>
                                            Eliminar
                                        </Text>
                                    </Pressable>
                                </View>
                                {recentSearches.map((search, index) => (
                                    <Pressable
                                        key={index}
                                        style={styles.recentItem}
                                        onPress={() =>
                                            handleRecentSearch(search)
                                        }
                                    >
                                        <Ionicons
                                            name="time-outline"
                                            size={20}
                                            color="#666"
                                        />
                                        <Text style={styles.recentText}>
                                            {search}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        {/* Marcas más buscadas */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Marcas más buscadas
                            </Text>
                            <View style={styles.brandsGrid}>
                                {topBrands.map((brand, index) => (
                                    <Pressable
                                        key={brand.id || brand._id || index}
                                        style={styles.brandChip}
                                        onPress={() =>
                                            handleSelectResult({
                                                type: 'business',
                                                data: brand,
                                            })
                                        }
                                    >
                                        <Text
                                            style={styles.brandText}
                                            numberOfLines={1}
                                        >
                                            {brand.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Clicks rápidos */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Clicks rápidos
                            </Text>
                            <View style={styles.quickGrid}>
                                {quickClicks.map(item => (
                                    <Pressable
                                        key={item.id}
                                        style={styles.quickChip}
                                        onPress={() =>
                                            setSearchQuery(item.label)
                                        }
                                    >
                                        <Ionicons
                                            name={item.icon}
                                            size={16}
                                            color="#9B59B6"
                                        />
                                        <Text style={styles.quickText}>
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
        color: '#9B59B6',
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

    // Marcas más buscadas
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

    // Clicks rápidos
    quickGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
    },
    quickChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
