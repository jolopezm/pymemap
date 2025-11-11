import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

    const login = async userData => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData))
            setUser(userData)
        } catch (error) {
            console.error('Error saving user to storage:', error)
        }
    }

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user')
            setUser(null)
        } catch (error) {
            console.error('Error removing user from storage:', error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => React.useContext(AuthContext)
