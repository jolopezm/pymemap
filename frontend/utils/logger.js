/**
 * Utilidad para logging condicional
 * Solo muestra logs en desarrollo, oculta en producción
 */

const isDev = __DEV__

export const logger = {
    /**
     * Log de información general
     */
    log: (...args) => {
        if (isDev) {
            console.log(...args)
        }
    },

    /**
     * Log de advertencias
     */
    warn: (...args) => {
        if (isDev) {
            console.warn(...args)
        }
    },

    /**
     * Log de errores
     * En producción podrías enviar a servicio como Sentry
     */
    error: (...args) => {
        if (isDev) {
            console.error(...args)
        }
        // En producción: integrar con servicio de monitoreo de errores
    },

    /**
     * Log de debugging (solo en dev)
     */
    debug: (...args) => {
        if (isDev) {
            console.log('🐛 DEBUG:', ...args)
        }
    },

    /**
     * Log de éxito (con emoji para mejor visualización)
     */
    success: (...args) => {
        if (isDev) {
            console.log('✅', ...args)
        }
    },

    /**
     * Log de información (con emoji para mejor visualización)
     */
    info: (...args) => {
        if (isDev) {
            console.log('ℹ️', ...args)
        }
    },
}

export default logger
