import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { login as loginService, getCurrentUser } from '../api/auth-service'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user')
                if (storedUser) {
                    setUser(JSON.parse(storedUser))
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
            await AsyncStorage.setItem('user', JSON.stringify(userData))
            setUser(userData)
            
            return userData
        } catch (error) {
            console.error('Error during login:', error)
            throw error
        }
    }

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user')
            await AsyncStorage.removeItem('token')
            await AsyncStorage.removeItem('authData')
            setUser(null)
        } catch (error) {
            console.error('Error during logout:', error)
        }
    }

    const refreshUser = async () => {
        try {
            const userData = await getCurrentUser()
            await AsyncStorage.setItem('user', JSON.stringify(userData))
            setUser(userData)
            return userData
        } catch (error) {
            console.error('Error refreshing user:', error)
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => React.useContext(AuthContext)
