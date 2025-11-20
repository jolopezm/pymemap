import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { login as loginService, getCurrentUser } from '../api/auth-service'
import { clearAllCache } from '../utils/cache-manager'

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
                        console.log(
                            '⚠️ No se pudo actualizar usuario, usando caché'
                        )
                    }
                }
            } catch (error) {
                console.error('Error loading user from storage:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [])

    const login = async ({ email, password }) => {
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
            console.error('Error during login:', error)
            throw error
        }
    }

    const logout = async () => {
        try {
            // Limpiar TODO el caché de la aplicación
            await clearAllCache()
            setUser(null)
            setIsFromCache(false)
        } catch (error) {
            console.error('Error during logout:', error)
        }
    }

    const refreshUser = async () => {
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
            console.error('Error refreshing user:', error)
            throw error
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                refreshUser,
                loading,
                isFromCache,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => React.useContext(AuthContext)
