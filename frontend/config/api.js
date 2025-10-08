// Configuración inteligente de API
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const API_URLS = {
  local: 'http://localhost:8000',
  production: 'https://pymemap-production.up.railway.app'
}

// Usar local si estamos en localhost, sino producción
export const API_URL = isLocalhost ? API_URLS.local : API_URLS.production

// Para debugging
console.log(`🔗 Conectando a: ${API_URL} (${isLocalhost ? 'LOCAL' : 'PRODUCCIÓN'})`)

// Exportar URLs por si las necesitas
export { API_URLS }
