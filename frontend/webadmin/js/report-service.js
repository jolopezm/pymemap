/**
 * PymeMap Admin - Report Service
 * Servicio para gestión de reportes/casos
 */

const API_URL = 'https://pymemap-production-306f.up.railway.app'
// Para desarrollo local, descomenta:
// const API_URL = 'http://localhost:8000';

/**
 * Obtiene los headers de autenticación
 */
async function getAuthHeaders() {
    const token = localStorage.getItem('token')
    const headers = {
        'Content-Type': 'application/json',
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    return headers
}

/**
 * Obtiene todos los reportes
 * @returns {Promise<Array>} Lista de reportes
 */
export async function getReports() {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}/reports/`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error('Error al obtener reportes')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en getReports:', error)
        throw error
    }
}

/**
 * Crea un nuevo reporte
 * @param {Object} reportData - Datos del reporte
 * @returns {Promise<Object>} Reporte creado
 */
export async function createReport(reportData) {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}/reports/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(reportData),
        })

        if (!response.ok) {
            throw new Error('Error al crear reporte')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en createReport:', error)
        throw error
    }
}

/**
 * Actualiza el estado de un reporte
 * @param {string} reportId - ID del reporte
 * @param {string} state - Nuevo estado (open, in_progress, resolved, closed)
 * @returns {Promise<Object>} Reporte actualizado
 */
export async function updateReportState(reportId, state) {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}/reports/${reportId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ state }),
        })

        if (!response.ok) {
            throw new Error('Error al actualizar estado del reporte')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en updateReportState:', error)
        throw error
    }
}

/**
 * Agrega una respuesta a un reporte
 * @param {string} reportId - ID del reporte
 * @param {string} response - Texto de la respuesta
 * @returns {Promise<Object>} Reporte actualizado
 */
export async function addReportResponse(reportId, response) {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(
            `${API_URL}/reports/${reportId}/response`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({ response }),
            }
        )

        if (!response.ok) {
            throw new Error('Error al agregar respuesta')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en addReportResponse:', error)
        throw error
    }
}

/**
 * Obtiene reportes filtrados
 * @param {Object} filters - Filtros a aplicar
 * @param {string} filters.type - Tipo de reporte
 * @param {string} filters.state - Estado del reporte
 * @param {string} filters.startDate - Fecha inicio
 * @param {string} filters.endDate - Fecha fin
 * @returns {Promise<Array>} Lista de reportes filtrados
 */
export async function getFilteredReports(filters = {}) {
    try {
        const headers = await getAuthHeaders()

        // Construir query params
        const params = new URLSearchParams()
        if (filters.type) params.append('type', filters.type)
        if (filters.state) params.append('state', filters.state)
        if (filters.startDate) params.append('start_date', filters.startDate)
        if (filters.endDate) params.append('end_date', filters.endDate)

        const url = `${API_URL}/reports/?${params.toString()}`

        const response = await fetch(url, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error('Error al obtener reportes filtrados')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en getFilteredReports:', error)
        throw error
    }
}

/**
 * Tipos de reportes disponibles
 */
export const REPORT_TYPES = {
    SERVICE_ISSUE: 'service_issue',
    PAYMENT_ISSUE: 'payment_issue',
    BEHAVIOR_ISSUE: 'behavior_issue',
    TECHNICAL_ISSUE: 'technical_issue',
    OTHER: 'other',
}

/**
 * Estados de reportes disponibles
 */
export const REPORT_STATES = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
}

/**
 * Traducciones de tipos de reportes
 */
export const REPORT_TYPE_LABELS = {
    service_issue: 'Problema con el servicio',
    payment_issue: 'Problema de pago',
    behavior_issue: 'Problema de comportamiento',
    technical_issue: 'Problema técnico',
    other: 'Otro',
}

/**
 * Traducciones de estados
 */
export const REPORT_STATE_LABELS = {
    open: 'Abierto',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
}
