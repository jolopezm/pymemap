import { useState, useCallback } from 'react'

/**
 * Hook para manejar pull-to-refresh de forma consistente
 * @param {Function} refreshFunction - Función async a ejecutar al refrescar
 * @returns {Object} { refreshing, onRefresh }
 */
export function useRefresh(refreshFunction) {
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = useCallback(async () => {
        console.log('🔄 Pull-to-refresh activado')
        setRefreshing(true)
        try {
            await refreshFunction()
            console.log('✅ Refresh completado')
        } catch (error) {
            console.error('❌ Error en refresh:', error)
        } finally {
            setRefreshing(false)
        }
    }, [refreshFunction])

    return {
        refreshing,
        onRefresh,
    }
}
