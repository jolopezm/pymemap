import { useState, useCallback } from 'react'
import logger from '../utils/logger'

export function useRefresh(refreshFunction) {
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        try {
            await refreshFunction()
        } catch (error) {
            logger.error('Error en refresh:', error)
        } finally {
            setRefreshing(false)
        }
    }, [refreshFunction])

    return {
        refreshing,
        onRefresh,
    }
}
