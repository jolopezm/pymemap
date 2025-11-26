/**
 * PymeMap - Shared Auth Service
 * Servicio de autenticación compartido entre web y mobile
 *
 * Para usar en web: importar desde aquí y usar adaptadores web
 * Para usar en mobile: importar desde aquí y usar adaptadores mobile
 */

// ============================================
// ABSTRACCIÓN DE STORAGE
// ============================================

/**
 * Adaptador de storage que funciona en web y mobile
 */
class StorageAdapter {
    constructor(storage) {
        this.storage = storage
    }

    async getItem(key) {
        return await this.storage.getItem(key)
    }

    async setItem(key, value) {
        return await this.storage.setItem(key, value)
    }

    async removeItem(key) {
        return await this.storage.removeItem(key)
    }
}

// Crear instancia según el entorno
let storage

if (typeof window !== 'undefined' && window.localStorage) {
    // Entorno Web - usar localStorage
    storage = new StorageAdapter({
        getItem: key => Promise.resolve(localStorage.getItem(key)),
        setItem: (key, value) =>
            Promise.resolve(localStorage.setItem(key, value)),
        removeItem: key => Promise.resolve(localStorage.removeItem(key)),
    })
} else {
    // Entorno React Native - usar AsyncStorage
    // Nota: AsyncStorage debe ser importado externamente
    storage = null // Se configura con setStorage()
}

/**
 * Configura el storage para React Native
 * @param {Object} asyncStorage - AsyncStorage de React Native
 */
export function setStorage(asyncStorage) {
    storage = new StorageAdapter(asyncStorage)
}

// ============================================
// ABSTRACCIÓN DE HTTP
// ============================================

/**
 * Cliente HTTP unificado que funciona con fetch y axios
 */
class HttpClient {
    constructor(baseURL) {
        this.baseURL = baseURL
    }

    async request(url, options = {}) {
        const fullUrl = `${this.baseURL}${url}`

        // Agregar token si existe
        const token = await storage.getItem('token')
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        // Usar fetch (disponible en web y React Native moderno)
        const response = await fetch(fullUrl, {
            ...options,
            headers,
        })

        // Manejar 401
        if (response.status === 401) {
            await this.handleUnauthorized()
        }

        return response
    }

    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' })
    }

    async post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async handleUnauthorized() {
        await logout()
        if (typeof window !== 'undefined') {
            window.location.href = 'login.html'
        }
    }
}

// API URL - puede ser configurada
let API_URL = 'https://pymemap-production-306f.up.railway.app'

/**
 * Configura la URL de la API
 * @param {string} url - URL base de la API
 */
export function setApiUrl(url) {
    API_URL = url
}

const httpClient = new HttpClient(API_URL)

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Obtiene el usuario actual autenticado
 */
export async function getCurrentUser() {
    try {
        const token = await storage.getItem('token')
        if (!token) {
            return null
        }

        const response = await httpClient.get('/users/me')

        if (!response.ok) {
            throw new Error('Error al obtener usuario')
        }

        const userData = await response.json()
        await storage.setItem('user', JSON.stringify(userData))
        return userData
    } catch (error) {
        console.error('Error en getCurrentUser:', error)
        return null
    }
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated() {
    const token = await storage.getItem('token')
    return !!token
}

/**
 * Obtiene el token almacenado
 */
export async function getToken() {
    return await storage.getItem('token')
}

/**
 * Obtiene los datos del usuario almacenados
 */
export async function getStoredUser() {
    const userStr = await storage.getItem('user')
    if (!userStr) return null

    try {
        return JSON.parse(userStr)
    } catch (error) {
        console.error('Error parsing user data:', error)
        return null
    }
}

/**
 * Inicia sesión con email y contraseña
 */
export async function login({ email, password }) {
    try {
        const response = await httpClient.post('/login', { email, password })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al iniciar sesión')
        }

        const data = await response.json()

        if (data.access_token) {
            await storage.setItem('token', data.access_token)
            await getCurrentUser()
        }

        return data
    } catch (error) {
        console.error('Error en login:', error)
        throw error
    }
}

/**
 * Cierra sesión del usuario
 */
export async function logout() {
    await storage.removeItem('token')
    await storage.removeItem('user')
    await storage.removeItem('authData')
}

/**
 * Envía código de autenticación por email
 */
export async function sendAuthCode(email) {
    try {
        const response = await httpClient.post('/send-auth-code', { email })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al enviar código')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en sendAuthCode:', error)
        throw error
    }
}

/**
 * Verifica el código de autenticación
 */
export async function verifyAuthCode(authData) {
    try {
        const response = await httpClient.post('/verify-auth-code', authData)

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Código inválido')
        }

        const data = await response.json()

        if (data.access_token) {
            await storage.setItem('token', data.access_token)
            await getCurrentUser()
        }

        return data
    } catch (error) {
        console.error('Error en verifyAuthCode:', error)
        throw error
    }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(role) {
    const user = await getStoredUser()
    if (!user) return false

    return user.role === role || user.user_type === role
}

/**
 * Verifica si el usuario es admin
 */
export async function isAdmin() {
    return await hasRole('admin')
}

/**
 * Verifica si el usuario es negocio
 */
export async function isBusiness() {
    return await hasRole('business')
}

// ============================================
// EXPORTAR CLIENTE HTTP (para casos avanzados)
// ============================================

export { httpClient }
