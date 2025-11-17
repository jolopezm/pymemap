// Configuración de API
const API_URLS = {
    local: 'http://localhost:8000',
    production: 'https://pymemap-production-306f.up.railway.app',
}

// Leer variable de entorno o usar producción por defecto
const forceEnv = process.env.EXPO_PUBLIC_API_ENV

// Exportar URL según configuración
export const API_URL =
    forceEnv === 'local' ? API_URLS.local : API_URLS.production

// Para debugging - mostrar configuración actual
console.log(`🔗 API URL: ${API_URL}`)
console.log(`🔧 Entorno: ${forceEnv || 'production (default)'}`)

// Exportar URLs por si las necesitas
export { API_URLS }
