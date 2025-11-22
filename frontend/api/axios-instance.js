import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'
import logger from '../utils/logger'

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        } catch (error) {
            logger.error('Error getting token from storage:', error)
        }
        return config
    },
    (error) => {
        logger.error('Request interceptor error:', error)
        return Promise.reject(error)
    }
)

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            logger.warn('Token expired, clearing session')
            
            try {
                await AsyncStorage.multiRemove(['token', 'user', 'authData'])
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('unauthorized'))
                }
            } catch (cleanupError) {
                logger.error('Error cleaning up after 401:', cleanupError)
            }
        }

        if (error.response?.status === 403) {
            logger.warn('Access forbidden:', error.config?.url)
        }

        if (error.response?.status === 500) {
            logger.error('Server error (500):', {
                url: error.config?.url,
                data: error.response?.data,
            })
        }

        if (!error.response) {
            logger.error('Network error:', error.message)
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
