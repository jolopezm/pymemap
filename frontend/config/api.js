// Configuración inteligente de API con soporte para localhost y 127.0.0.1
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const API_URLS = {
  local: typeof window !== 'undefined' && window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:8000'  // Usar 127.0.0.1 si el frontend está en esa IP
    : 'http://localhost:8000', // Usar localhost por defecto
  production: 'https://pymemap-production.up.railway.app'
}

// Usar local si estamos en desarrollo, sino producción
export const API_URL = isLocalhost ? API_URLS.local : API_URLS.production

// Para debugging - mostrar configuración actual
console.log(`🔗 Conectando a: ${API_URL} (${isLocalhost ? 'LOCAL' : 'PRODUCCIÓN'})`)

// Exportar URLs por si las necesitas
export { API_URLS }
