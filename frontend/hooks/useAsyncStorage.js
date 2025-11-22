import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import logger from '../utils/logger'

const cache = new Map()

export function useAsyncStorage(key, defaultValue = null) {
    const [value, setValue] = useState(() => cache.get(key) || defaultValue)
    const [loading, setLoading] = useState(!cache.has(key))
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadValue = async () => {
            try {
                const stored = await AsyncStorage.getItem(key)
                if (stored !== null) {
                    const parsed = JSON.parse(stored)
                    cache.set(key, parsed)
                    setValue(parsed)
                } else {
                    setValue(defaultValue)
                }
            } catch (err) {
                logger.error(`Error loading ${key} from AsyncStorage:`, err)
                setError(err)
                setValue(defaultValue)
            } finally {
                setLoading(false)
            }
        }

        // Solo cargar si no está en caché
        if (!cache.has(key)) {
            loadValue()
        } else {
            setLoading(false)
        }
    }, [key, defaultValue])

    const updateValue = useCallback(
        async (newValue) => {
            try {
                await AsyncStorage.setItem(key, JSON.stringify(newValue))
                cache.set(key, newValue)
                setValue(newValue)
                setError(null)
            } catch (err) {
                logger.error(`Error updating ${key} in AsyncStorage:`, err)
                setError(err)
                throw err
            }
        },
        [key]
    )

    const removeValue = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(key)
            cache.delete(key)
            setValue(defaultValue)
            setError(null)
        } catch (err) {
            logger.error(`Error removing ${key} from AsyncStorage:`, err)
            setError(err)
            throw err
        }
    }, [key, defaultValue])

    return [value, updateValue, removeValue, loading, error]
}

export function useAsyncStorageRead(key, defaultValue = null) {
    const [value, , , loading, error] = useAsyncStorage(key, defaultValue)
    return { value, loading, error }
}

export function clearAsyncStorageCache() {
    cache.clear()
}
