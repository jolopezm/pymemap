const API_URLS = {
    local: 'http://localhost:8000',
    production: 'http://localhost:8000',
    //production: 'https://pymemap-production-306f.up.railway.app',
}

const forceEnv = process.env.EXPO_PUBLIC_API_ENV

export const API_URL =
    forceEnv === 'local' ? API_URLS.local : API_URLS.production

console.log(`🔗 API URL: ${API_URL}`)
console.log(`🔧 Entorno: ${forceEnv || 'production (default)'}`)

export { API_URLS }
