import { createContext, useState, useContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    getCurrentUser,
    login as loginService,
    logout as logoutService,
} from '../api/auth-service'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('token')

            if (token) {
                const userData = await getCurrentUser()
                setUser(userData)
                setIsAuthenticated(true)
            }
        } catch (error) {
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }

    const login = async userData => {
        try {
            await loginService(userData)
            const user = await getCurrentUser()

            setUser(user)
            setIsAuthenticated(true)

            return { success: true, data: user }
        } catch (error) {
            throw error
        }
    }

    const logout = async () => {
        try {
            await logoutService()
            setUser(null)
            setIsAuthenticated(false)
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al cerrar sesión',
            }
        }
    }

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
