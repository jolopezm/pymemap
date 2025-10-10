import { useState, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../context/auth-context'
import DefaultModal from '../components/default-modal'
import globalStyles from '../styles/global'
import Screen from '../components/screen'
import SearchBar from '../components/search-bar'
import { getBusiness } from '../api/business-service'
import Item from '../plantillas/business-item'
import DismissKeyboard from '../components/dismiss-keyboard'
import Button from '../components/button'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

export default function Home() {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter()
    const [modalVisible, setModalVisible] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState([])

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    const handleModal = () => {
        setModalVisible(!modalVisible)
    }

    useEffect(() => {
        if (searchTerm.length === 0) {
            setResults([])
            return
        }
        let isMounted = true
        getBusiness()
            .then(data => {
                if (isMounted) {
                    const filtered = data.filter(b =>
                        b.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    setResults(filtered)
                }
            })
            .catch(() => setResults([]))
        return () => {
            isMounted = false
        }
    }, [searchTerm])

    return (
        <DismissKeyboard>
            <LinearGradient
                colors={['#9B59B6', '#F8BBD9']}
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                {/* Header con logo y botón de sesión */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="business" size={36} color="#FFFFFF" />
                        <Text style={styles.logoText}>pymemap</Text>
                    </View>
                    
                    <View style={styles.headerActions}>
                        {isAuthenticated ? (
                            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                                <Ionicons name="log-out" size={20} color="#FFFFFF" />
                                <Text style={styles.logoutText}>Cerrar</Text>
                            </Pressable>
                        ) : (
                            <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
                                <Ionicons name="log-in" size={20} color="#FFFFFF" />
                                <Text style={styles.loginText}>Iniciar</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Barra de búsqueda mejorada */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                        <SearchBar 
                            searchTerm={searchTerm} 
                            setSearchTerm={setSearchTerm}
                            style={styles.searchInput}
                        />
                    </View>
                </View>

                {/* Contenido principal */}
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.contentContainer}
                >
                    {/* Resultados de búsqueda */}
                    {results.length > 0 ? (
                        <View style={styles.resultsContainer}>
                            {results.map(business => (
                                <Item key={business._id} business={business} />
                            ))}
                        </View>
                    ) : searchTerm.length > 0 ? (
                        <View style={styles.noResultsContainer}>
                            <Ionicons name="search" size={48} color="#FFFFFF" style={{ opacity: 0.5 }} />
                            <Text style={styles.noResultsText}>
                                No se encontraron resultados
                            </Text>
                            <Text style={styles.noResultsSubtext}>
                                Intenta con otros términos de búsqueda
                            </Text>
                        </View>
                    ) : (
                        /* Contenido predeterminado cuando no hay búsqueda */
                        <View style={styles.defaultContent}>
                            <Text style={styles.welcomeText}>
                                ¡Encuentra los mejores servicios!
                            </Text>
                            <Text style={styles.welcomeSubtext}>
                                Busca negocios y servicios cerca de ti
                            </Text>

                            {/* Botones de acción para usuarios autenticados */}
                            {isAuthenticated && (
                                <View style={styles.actionButtons}>
                                    <Button
                                        title="Ver perfil"
                                        variant="secondary"
                                        onPress={() => router.push('/profile')}
                                        style={styles.actionButton}
                                    />
                                    <Button
                                        title="Registrar negocio"
                                        variant="primary"
                                        onPress={() => router.push('/new-business')}
                                        style={styles.actionButton}
                                    />
                                </View>
                            )}

                            {/* Enlaces adicionales */}
                            <View style={styles.linkContainer}>
                                <Button
                                    title="ℹ️ Sobre PymeMap"
                                    variant="outline"
                                    onPress={() => router.push('/about')}
                                    style={{ 
                                        borderColor: 'rgba(255, 255, 255, 0.6)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderWidth: 1
                                    }}
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Modal (conservamos funcionalidad existente) */}
                {modalVisible && (
                    <DefaultModal
                        visible={modalVisible}
                        onRequestClose={handleModal}
                    >
                        <Text style={[globalStyles.title, { color: '#333' }]}>
                            Código de autenticación
                        </Text>
                        <Text style={{ color: '#666', marginBottom: 20 }}>
                            Contenido del modal
                        </Text>
                        <Button
                            title="Cerrar modal"
                            variant="primary"
                            onPress={handleModal}
                        />
                    </DefaultModal>
                )}
                
                {/* Botón flotante para abrir modal (temporal) */}
                <Pressable style={styles.floatingButton} onPress={handleModal}>
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </Pressable>
            </LinearGradient>
        </DismissKeyboard>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    logoutText: {
        color: '#FFFFFF',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    loginText: {
        color: '#FFFFFF',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#6A4C93',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        // Resetear estilos del SearchBar para integrarlo
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 0,
        margin: 0,
        shadowOpacity: 0,
        elevation: 0,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    resultsContainer: {
        marginTop: 10,
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noResultsText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    noResultsSubtext: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.8,
        marginTop: 8,
        textAlign: 'center',
    },
    defaultContent: {
        alignItems: 'center',
        paddingTop: 40,
    },
    welcomeText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    welcomeSubtext: {
        color: '#FFFFFF',
        fontSize: 16,
        opacity: 0.9,
        textAlign: 'center',
        marginBottom: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 1,
    },
    actionButtons: {
        width: '100%',
        paddingHorizontal: 20,
    },
    actionButton: {
        marginBottom: 12,
    },
    linkContainer: {
        marginTop: 40,
    },
    link: {
        paddingVertical: 10,
    },
    linkText: {
        color: '#FFFFFF',
        fontSize: 16,
        textDecorationLine: 'underline',
        opacity: 0.8,
        textAlign: 'center',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6A4C93',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6A4C93',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
})
