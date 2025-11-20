import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
    getCacheInfo,
    clearDataCache,
    clearAllCache,
} from '../utils/cache-manager'

/**
 * Componente para debugging y gestión del caché
 * Puedes agregarlo en Settings o como pantalla de desarrollo
 */
export default function CacheDebugger() {
    const [cacheInfo, setCacheInfo] = useState(null)
    const [loading, setLoading] = useState(false)

    const loadCacheInfo = async () => {
        setLoading(true)
        const info = await getCacheInfo()
        setCacheInfo(info)
        setLoading(false)
    }

    useEffect(() => {
        loadCacheInfo()
    }, [])

    const handleClearDataCache = async () => {
        await clearDataCache()
        await loadCacheInfo()
    }

    const handleClearAllCache = async () => {
        await clearAllCache()
        await loadCacheInfo()
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Cargando información del caché...</Text>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="server-outline" size={32} color="#9B59B6" />
                <Text style={styles.title}>Gestor de Caché</Text>
            </View>

            {cacheInfo && (
                <>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Estadísticas</Text>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>
                                Total de items:
                            </Text>
                            <Text style={styles.statValue}>
                                {cacheInfo.totalItems}
                            </Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Tamaño total:</Text>
                            <Text style={styles.statValue}>
                                {cacheInfo.totalSizeKB} KB (
                                {cacheInfo.totalSizeMB} MB)
                            </Text>
                        </View>
                    </View>

                    <View style={styles.itemsCard}>
                        <Text style={styles.sectionTitle}>Items en Caché</Text>
                        {cacheInfo.items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <Text style={styles.itemKey} numberOfLines={1}>
                                    {item.key}
                                </Text>
                                <Text style={styles.itemSize}>
                                    {item.sizeKB} KB
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.actionsCard}>
                        <Pressable
                            style={styles.buttonPrimary}
                            onPress={loadCacheInfo}
                        >
                            <Ionicons name="refresh" size={20} color="#FFF" />
                            <Text style={styles.buttonText}>Recargar Info</Text>
                        </Pressable>

                        <Pressable
                            style={styles.buttonWarning}
                            onPress={handleClearDataCache}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={20}
                                color="#FFF"
                            />
                            <Text style={styles.buttonText}>Limpiar Datos</Text>
                        </Pressable>

                        <Pressable
                            style={styles.buttonDanger}
                            onPress={handleClearAllCache}
                        >
                            <Ionicons
                                name="nuclear-outline"
                                size={20}
                                color="#FFF"
                            />
                            <Text style={styles.buttonText}>Limpiar TODO</Text>
                        </Pressable>
                    </View>
                </>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statsCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9B59B6',
    },
    itemsCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemKey: {
        fontSize: 12,
        color: '#666',
        flex: 1,
        fontFamily: 'monospace',
    },
    itemSize: {
        fontSize: 12,
        color: '#999',
        marginLeft: 8,
    },
    actionsCard: {
        gap: 12,
    },
    buttonPrimary: {
        backgroundColor: '#9B59B6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    buttonWarning: {
        backgroundColor: '#F39C12',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    buttonDanger: {
        backgroundColor: '#E74C3C',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
})
