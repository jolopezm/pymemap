import { useMemo } from 'react'

export function useBusinessFilters(businesses, filters, sortOption, userCoords) {
    const filteredBusinesses = useMemo(() => {
        let filtered = [...businesses]

        if (filters.domicilio) {
            filtered = filtered.filter(business => business.hasDelivery !== false)
        }

        if (filters.recoger) {
            filtered = filtered.filter(business => business.hasPickup !== false)
        }

        if (filters.categories && filters.categories.length > 0) {
            filtered = filtered.filter(business => 
                filters.categories.some(cat => 
                    business.category?.toLowerCase().includes(cat.toLowerCase())
                )
            )
        }

        if (filters.distance && userCoords) {
            filtered = filtered.filter(business => {
                const hasDistance = business.distance !== undefined && business.distance !== null
                const withinRange = hasDistance && business.distance <= filters.distance
                return withinRange
            })
        }

        return filtered
    }, [businesses, filters, userCoords])

    const sortedBusinesses = useMemo(() => {
        let sorted = [...filteredBusinesses]
        
        switch(sortOption) {
            case 'Más cercanos':
                if (userCoords) {
                    sorted.sort((a, b) => {
                        const distA = a.distance !== undefined ? a.distance : Infinity
                        const distB = b.distance !== undefined ? b.distance : Infinity
                        return distA - distB
                    })
                }
                break
            
            case 'Mejor calificados':
                sorted.sort((a, b) => {
                    const ratingA = a.rating || 4.5 + Math.random() * 0.5
                    const ratingB = b.rating || 4.5 + Math.random() * 0.5
                    return ratingB - ratingA
                })
                break
            
            case 'Más populares':
                if (userCoords) {
                    sorted.sort((a, b) => {
                        const distA = a.distance !== undefined ? a.distance : Infinity
                        const distB = b.distance !== undefined ? b.distance : Infinity
                        return distA - distB
                    })
                }
                break
            
            case 'Nuevos':
                sorted.reverse()
                break
            
            case 'Recomendados':
            default:
                if (userCoords) {
                    sorted.sort((a, b) => {
                        const distA = a.distance !== undefined ? a.distance : Infinity
                        const distB = b.distance !== undefined ? b.distance : Infinity
                        return distA - distB
                    })
                }
                break
        }
        
        return sorted
    }, [filteredBusinesses, sortOption, userCoords])

    return {
        filteredBusinesses: sortedBusinesses,
        totalFiltered: sortedBusinesses.length,
        totalOriginal: businesses.length,
    }
}
