import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Sistema de caché para AsyncStorage con expiración
 */

const CACHE_PREFIX = '@pymemap_cache:'
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos por defecto

/**
 * Guardar datos en caché con timestamp
 * @param {string} key - Clave del caché
 * @param {any} data - Datos a guardar
 * @param {number} ttl - Tiempo de vida en ms (opcional)
 */
export async function setCache(key, data, ttl = DEFAULT_TTL) {
    try {
        const cacheData = {
            data,
            timestamp: Date.now(),
            ttl,
        }
        await AsyncStorage.setItem(
            `${CACHE_PREFIX}${key}`,
            JSON.stringify(cacheData)
        )
        console.log(`✅ Caché guardado: ${key}`)
    } catch (error) {
        console.error(`❌ Error guardando caché ${key}:`, error)
    }
}

/**
 * Obtener datos del caché si no han expirado
 * @param {string} key - Clave del caché
 * @returns {any|null} - Datos o null si no existe o expiró
 */
export async function getCache(key) {
    try {
        const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`)
        if (!cached) {
            console.log(`📭 Caché vacío: ${key}`)
            return null
        }

        const cacheData = JSON.parse(cached)
        const now = Date.now()
        const age = now - cacheData.timestamp

        // Verificar si expiró
        if (age > cacheData.ttl) {
            console.log(
                `⏰ Caché expirado: ${key} (${Math.round(age / 1000)}s)`
            )
            await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`)
            return null
        }

        console.log(
            `✅ Caché válido: ${key} (${Math.round(age / 1000)}s de ${Math.round(cacheData.ttl / 1000)}s)`
        )
        return cacheData.data
    } catch (error) {
        console.error(`❌ Error leyendo caché ${key}:`, error)
        return null
    }
}

/**
 * Invalidar (eliminar) caché
 * @param {string} key - Clave del caché
 */
export async function invalidateCache(key) {
    try {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`)
        console.log(`🗑️ Caché invalidado: ${key}`)
    } catch (error) {
        console.error(`❌ Error invalidando caché ${key}:`, error)
    }
}

/**
 * Limpiar todo el caché
 */
export async function clearAllCache() {
    try {
        const keys = await AsyncStorage.getAllKeys()
        const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
        await AsyncStorage.multiRemove(cacheKeys)
        console.log(`🗑️ ${cacheKeys.length} cachés eliminados`)
    } catch (error) {
        console.error('❌ Error limpiando caché:', error)
    }
}

/**
 * Obtener o ejecutar función con caché
 * @param {string} key - Clave del caché
 * @param {Function} fetchFunction - Función async para obtener datos
 * @param {number} ttl - Tiempo de vida en ms
 * @returns {Promise<any>}
 */
export async function getCachedOrFetch(key, fetchFunction, ttl = DEFAULT_TTL) {
    // Intentar obtener del caché primero
    const cached = await getCache(key)
    if (cached !== null) {
        return cached
    }

    // Si no hay caché o expiró, ejecutar función
    console.log(`🔄 Obteniendo datos frescos: ${key}`)
    const data = await fetchFunction()

    // Guardar en caché
    await setCache(key, data, ttl)

    return data
}

/**
 * Tiempos de vida predefinidos
 */
export const TTL = {
    SHORT: 1 * 60 * 1000, // 1 minuto
    MEDIUM: 5 * 60 * 1000, // 5 minutos
    LONG: 15 * 60 * 1000, // 15 minutos
    HOUR: 60 * 60 * 1000, // 1 hora
    DAY: 24 * 60 * 60 * 1000, // 1 día
}
