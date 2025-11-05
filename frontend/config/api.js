// Configuración inteligente de API con soporte para localhost y 127.0.0.1
const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')

const API_URLS = {
    local: 'http://localhost:8000',
    production: 'http://localhost:8000',
    //production: 'https://pymemap-production-306f.up.railway.app',
}

// Estrategia flexible: Usar variable de entorno si existe, sino detectar automáticamente
// Para forzar producción en desarrollo local, crea un archivo .env con: EXPO_PUBLIC_API_ENV=production
const forceEnv = process.env.EXPO_PUBLIC_API_ENV

export const API_URL =
    forceEnv === 'production'
        ? API_URLS.production
        : forceEnv === 'local'
          ? API_URLS.local
          : isLocalhost
            ? API_URLS.production // Por defecto usar producción en localhost (más conveniente para ti)
            : API_URLS.production

// Para debugging - mostrar configuración actual
console.log(
    `🔗 Conectando a: ${API_URL} (${isLocalhost ? 'LOCAL' : 'PRODUCCIÓN'})`
)

// Exportar URLs por si las necesitas
export { API_URLS }
