import React, {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { login as loginService, getCurrentUser } from '../api/auth-service'
import { clearAllCache } from '../utils/cache-manager'
import logger from '../utils/logger'

const AuthContext = createContext()

const STORAGE_KEYS = {
    USER: '@user_data',
    TOKEN: '@auth_token',
    AUTH_DATA: '@auth_data',
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isFromCache, setIsFromCache] = useState(false)

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER)
                if (storedUser) {
                    const userData = JSON.parse(storedUser)
                    setUser(userData)
                    setIsFromCache(true)

                    // Intentar refrescar en segundo plano
                    try {
                        const freshData = await getCurrentUser()
                        if (
                            JSON.stringify(freshData) !==
                            JSON.stringify(userData)
                        ) {
                            await AsyncStorage.setItem(
                                STORAGE_KEYS.USER,
                                JSON.stringify(freshData)
                            )
                            setUser(freshData)
                            setIsFromCache(false)
                        }
                    } catch (error) {
                        logger.log(
                            '⚠️ No se pudo actualizar usuario, usando caché'
                        )
                    }
                }
            } catch (error) {
                logger.error('Error loading user from storage:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [])

    const login = useCallback(async ({ email, password }) => {
        try {
            await loginService({ email, password })
            const userData = await getCurrentUser()
            await AsyncStorage.setItem(
                STORAGE_KEYS.USER,
                JSON.stringify(userData)
            )
            setUser(userData)
            setIsFromCache(false)

            return userData
        } catch (error) {
            throw error
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            // Limpiar TODO el caché de la aplicación
            await clearAllCache()
            setUser(null)
            setIsFromCache(false)
        } catch (error) {
            // Error manejado silenciosamente
        }
    }, [])

    const refreshUser = useCallback(async () => {
        try {
            const userData = await getCurrentUser()
            await AsyncStorage.setItem(
                STORAGE_KEYS.USER,
                JSON.stringify(userData)
            )
            setUser(userData)
            setIsFromCache(false)
            return userData
        } catch (error) {
            logger.error('Error refreshing user:', error)
            throw error
        }
    }, [])

    const value = useMemo(
        () => ({
            user,
            login,
            logout,
            refreshUser,
            loading,
            isFromCache,
        }),
        [user, loading, isFromCache, login, logout, refreshUser]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => React.useContext(AuthContext)

