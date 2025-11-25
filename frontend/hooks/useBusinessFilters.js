import { useMemo } from 'react'

export function useBusinessFilters(businesses, filters, sortOption, userCoords) {
    const filteredBusinesses = useMemo(() => {
        let filtered = [...businesses]

        if (filters.owners && filters.owners.length > 0) {
            filtered = filtered.filter(business => filters.owners.includes(business.owner_id))
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
                // Ensure distance is a number and valid
                const dist = parseFloat(business.distance)
                const hasDistance = !isNaN(dist)
                const withinRange = hasDistance && dist <= filters.distance
                return withinRange
            })
        }

        return filtered
    }, [businesses, filters, userCoords])

    const sortedBusinesses = useMemo(() => {
        let sorted = [...filteredBusinesses]

        switch (sortOption) {
            case 'Más cercanos':
                if (userCoords) {
                    sorted.sort((a, b) => {
                        const distA = a.distance !== undefined ? parseFloat(a.distance) : Infinity
                        const distB = b.distance !== undefined ? parseFloat(b.distance) : Infinity
                        return distA - distB
                    })
                }
                break

            case 'Mejor calificados':
                sorted.sort((a, b) => {
                    const ratingA = a.rating || 0
                    const ratingB = b.rating || 0
                    return ratingB - ratingA
                })
                break

            case 'Más populares':
                if (userCoords) {
                    sorted.sort((a, b) => {
                        const distA = a.distance !== undefined ? parseFloat(a.distance) : Infinity
                        const distB = b.distance !== undefined ? parseFloat(b.distance) : Infinity
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
                        const distA = a.distance !== undefined ? parseFloat(a.distance) : Infinity
                        const distB = b.distance !== undefined ? parseFloat(b.distance) : Infinity
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
