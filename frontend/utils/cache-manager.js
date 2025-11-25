import AsyncStorage from '@react-native-async-storage/async-storage'
import logger from './logger'

/**
 * Gestor centralizado de caché para toda la aplicación
 */

// Todas las keys de caché usadas en la app
const ALL_CACHE_KEYS = [
    // Auth
    '@user_data',
    '@auth_token',
    '@auth_data',

    // Chats
    '@chats_data',
    '@other_users_data',
    '@chats_cache_timestamp',

    // Services
    '@services_data',
    '@services_cache_timestamp',

    // Notifications
    '@notifications_data',
    '@notifications_cache_timestamp',

    // Location
    '@user_location',
    '@user_coords',
    '@location_cache_timestamp',

    // Legacy keys (por compatibilidad)
    'user',
    'token',
    'authData',
    'notifications',
]

/**
 * Limpia TODO el caché de la aplicación
 * Útil al cerrar sesión o resetear la app
 */
export const clearAllCache = async () => {
    try {
        await AsyncStorage.multiRemove(ALL_CACHE_KEYS)
        return true
    } catch (error) {
        logger.error('Error limpiando caché:', error)
        return false
    }
}

/**
 * Limpia solo el caché de autenticación
 */
export const clearAuthCache = async () => {
    try {
        await AsyncStorage.multiRemove([
            '@user_data',
            '@auth_token',
            '@auth_data',
            'user',
            'token',
            'authData',
        ])
        return true
    } catch (error) {
        console.error('Error limpiando caché de auth:', error)
        return false
    }
}

/**
 * Limpia solo el caché de datos (chats, servicios, notificaciones)
 * Mantiene datos de autenticación y ubicación
 */
export const clearDataCache = async () => {
    try {
        await AsyncStorage.multiRemove([
            '@chats_data',
            '@other_users_data',
            '@chats_cache_timestamp',
            '@services_data',
            '@services_cache_timestamp',
            '@notifications_data',
            '@notifications_cache_timestamp',
            'notifications',
        ])
        return true
    } catch (error) {
        console.error('Error limpiando caché de datos:', error)
        return false
    }
}

/**
 * Obtiene información sobre el tamaño del caché
 */
export const getCacheInfo = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys()
        const cacheKeys = allKeys.filter(
            key => key.startsWith('@') || ALL_CACHE_KEYS.includes(key)
        )

        const items = await AsyncStorage.multiGet(cacheKeys)

        let totalSize = 0
        const cacheInfo = items.map(([key, value]) => {
            const size = value ? new Blob([value]).size : 0
            totalSize += size
            return {
                key,
                size,
                sizeKB: (size / 1024).toFixed(2),
            }
        })

        return {
            totalItems: cacheKeys.length,
            totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
            items: cacheInfo,
        }
    } catch (error) {
        console.error('Error obteniendo info del caché:', error)
        return null
    }
}

/**
 * Verifica si una key específica existe y cuándo fue actualizada
 */
export const getCacheStatus = async (dataKey, timestampKey) => {
    try {
        const [[, data], [, timestamp]] = await AsyncStorage.multiGet([
            dataKey,
            timestampKey,
        ])

        if (!data || !timestamp) {
            return { exists: false }
        }

        const cacheAge = Date.now() - parseInt(timestamp)

        return {
            exists: true,
            cacheAge,
            cacheAgeMinutes: Math.floor(cacheAge / 60000),
            lastUpdate: new Date(parseInt(timestamp)).toISOString(),
        }
    } catch (error) {
        console.error('Error verificando estado del caché:', error)
        return { exists: false, error: error.message }
    }
}

export default {
    clearAllCache,
    clearAuthCache,
    clearDataCache,
    getCacheInfo,
    getCacheStatus,
}
