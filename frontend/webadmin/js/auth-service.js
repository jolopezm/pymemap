/**
 * PymeMap Admin - Authentication Service
 * Adaptado para uso en navegador (localStorage + fetch)
 */

// Configuración de API
const API_URL = 'https://pymemap-production-306f.up.railway.app'
// Para desarrollo local, descomenta:
// const API_URL = 'http://localhost:8000';

/**
 * Interceptor para agregar token a todas las peticiones
 */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token')

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    // Si es 401, hacer logout automático
    if (response.status === 401) {
        await logout()
        window.location.href = 'login.html'
    }

    return response
}

/**
 * Obtiene el usuario actual autenticado
 * @returns {Promise<Object|null>} Usuario o null si no está autenticado
 */
export async function getCurrentUser() {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            return null
        }

        const response = await fetchWithAuth(`${API_URL}/users/me`)

        if (!response.ok) {
            throw new Error('Error al obtener usuario')
        }

        const userData = await response.json()
        localStorage.setItem('user', JSON.stringify(userData))
        return userData
    } catch (error) {
        console.error('Error en getCurrentUser:', error)
        return null
    }
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si tiene token
 */
export function isAuthenticated() {
    const token = localStorage.getItem('token')
    return !!token
}

/**
 * Obtiene el token almacenado
 * @returns {string|null} Token JWT o null
 */
export function getToken() {
    return localStorage.getItem('token')
}

/**
 * Obtiene los datos del usuario almacenados
 * @returns {Object|null} Datos del usuario o null
 */
export function getStoredUser() {
    const userStr = localStorage.getItem('user')
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
 * @param {Object} credentials - Credenciales de login
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña
 * @returns {Promise<Object>} Respuesta con token
 */
export async function login({ email, password }) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al iniciar sesión')
        }

        const data = await response.json()

        if (data.access_token) {
            localStorage.setItem('token', data.access_token)

            // Obtener y guardar datos del usuario
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('authData')
}

/**
 * Envía código de autenticación por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function sendAuthCode(email) {
    try {
        const response = await fetch(`${API_URL}/send-auth-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })

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
 * @param {Object} authData - Datos de autenticación
 * @param {string} authData.email - Email del usuario
 * @param {string} authData.code - Código recibido
 * @returns {Promise<Object>} Respuesta con token
 */
export async function verifyAuthCode(authData) {
    try {
        const response = await fetch(`${API_URL}/verify-auth-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(authData),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Código inválido')
        }

        const data = await response.json()

        if (data.access_token) {
            localStorage.setItem('token', data.access_token)
            await getCurrentUser()
        }

        return data
    } catch (error) {
        console.error('Error en verifyAuthCode:', error)
        throw error
    }
}

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string} role - Rol a verificar (admin, business, etc)
 * @returns {boolean} True si el usuario tiene el rol
 */
export function hasRole(role) {
    const user = getStoredUser()
    if (!user) return false

    // Adaptar según tu estructura de usuario
    return user.role === role || user.user_type === role
}

/**
 * Verifica si el usuario es admin
 * @returns {boolean} True si es admin
 */
export function isAdmin() {
    return hasRole('admin')
}

/**
 * Verifica si el usuario es negocio
 * @returns {boolean} True si es negocio
 */
export function isBusiness() {
    return hasRole('business')
}
