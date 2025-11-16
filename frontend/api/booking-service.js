import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'

async function getAuthHeaders() {
    const token = await AsyncStorage.getItem('token')
    if (token) {
        return {
            Authorization: `Bearer ${token}`,
        }
    }
    return {}
}

/**
 * Obtener días disponibles de un negocio para un mes
 */
export async function getBusinessAvailability(businessId, year, month) {
    try {
        const headers = await getAuthHeaders()
        const response = await axios.get(
            `${API_URL}/bookings/business/${businessId}/availability/${year}/${month}`,
            { headers }
        )
        return response.data
    } catch (error) {
        console.error(
            'Error getting business availability:',
            error.response?.data || error.message
        )
        return []
    }
}

/**
 * Obtener slots de horario disponibles para una fecha específica
 */
export async function getAvailableSlots(businessId, date) {
    try {
        const headers = await getAuthHeaders()
        const response = await axios.get(
            `${API_URL}/bookings/business/${businessId}/availability/date/${date}/slots`,
            { headers }
        )
        return response.data
    } catch (error) {
        console.error(
            'Error getting available slots:',
            error.response?.data || error.message
        )
        throw error
    }
}

/**
 * Crear solicitud de reserva
 */
export async function createBooking(bookingData) {
    try {
        const headers = await getAuthHeaders()
        console.log('Creating booking:', bookingData)
        const response = await axios.post(`${API_URL}/bookings`, bookingData, {
            headers,
        })
        console.log('Booking created:', response.data)
        return response.data
    } catch (error) {
        console.error(
            'Error creating booking:',
            error.response?.data || error.message
        )
        throw error
    }
}

/**
 * Confirmar reserva (dueño de negocio)
 */
export async function confirmBooking(bookingId) {
    const headers = await getAuthHeaders()
    const response = await axios.patch(
        `${API_URL}/bookings/${bookingId}/confirm`,
        {},
        { headers }
    )
    return response.data
}

/**
 * Obtener mis reservas (cliente)
 */
export async function getMyBookings() {
    const headers = await getAuthHeaders()
    const response = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers,
    })
    return response.data
}

/**
 * Obtener reservas de un negocio (dueño)
 */
export async function getBusinessBookings(businessId) {
    try {
        const headers = await getAuthHeaders()
        console.log('Fetching bookings for business:', businessId)
        const response = await axios.get(
            `${API_URL}/bookings/business/${businessId}/bookings`,
            { headers }
        )
        console.log('Bookings fetched:', response.data)
        return response.data
    } catch (error) {
        console.error(
            'Error getting business bookings:',
            error.response?.data || error.message
        )
        return []
    }
}

/**
 * Configurar disponibilidad de negocio (dueño)
 */
export async function setBusinessAvailability(businessId, availabilityData) {
    try {
        const headers = await getAuthHeaders()
        console.log('Setting availability:', availabilityData)
        const response = await axios.post(
            `${API_URL}/bookings/business/${businessId}/availability`,
            availabilityData,
            { headers }
        )
        console.log('Availability set:', response.data)
        return response.data
    } catch (error) {
        console.error(
            'Error setting availability:',
            error.response?.data || error.message
        )
        throw error
    }
}
