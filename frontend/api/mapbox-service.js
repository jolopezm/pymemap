import axios from 'axios'
import { API_URL } from '../config/api'

/**
 * Obtiene sugerencias de direcciones desde nuestro backend, que actúa como proxy para Mapbox.
 * @param {string} searchText - El texto a buscar.
 * @param {string} region - La región para limitar la búsqueda (ej. 'metropolitana').
 * @returns {Promise<Array>} - Una promesa que resuelve a un array de 'features' de Mapbox.
 */
export async function getGeocodingSuggestions(
    searchText,
    region = 'metropolitana'
) {
    if (!searchText || searchText.trim().length < 3) {
        return [] // No buscar si el texto es muy corto
    }
    try {
        const response = await axios.get(
            `${API_URL}/mapbox/geocoding/${encodeURIComponent(searchText)}`,
            {
                params: {
                    region: region,
                    limit: 5,
                },
            }
        )
        return response.data.features || []
    } catch (error) {
        console.error('Error fetching geocoding suggestions:', error)
        return []
    }
}
