import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getBusiness } from '../api/business-service'
import { StatusBar } from 'expo-status-bar'
import { calculateBusinessDistances } from '../utils/geolocation'
import { useLocation } from '../context/location-context'
import { useRefresh } from '../hooks/useRefresh'
import { colors, spacing } from '../styles/theme'
import logger from '../utils/logger'
import LoadingState from '../components/LoadingState'
import {
    SearchInput,
    RecentSearches,
    SearchResults,
    SearchFilters,
} from '../components/search'

export default function SearchScreen() {
    const router = useRouter()
    const { userCoords } = useLocation()
    const [searchQuery, setSearchQuery] = useState('')
    const [businesses, setBusinesses] = useState([])
    const [nearbyFilter, setNearbyFilter] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const businessData = await getBusiness()
            setBusinesses(businessData)
        } catch (error) {
            logger.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const { refreshing, onRefresh } = useRefresh(fetchData)

    useEffect(() => {
        if (userCoords && businesses.length > 0) {
            const withDistances = calculateBusinessDistances(businesses, userCoords)
            setBusinesses(withDistances)
        }
    }, [userCoords])

    const getSearchResults = useMemo(() => {
        if (nearbyFilter && !searchQuery.trim() && userCoords) {
            const nearbyDistance = 3
            return businesses
                .filter(b => b.distance !== undefined && b.distance <= nearbyDistance)
                .map(b => ({ type: 'business', data: b }))
                .sort((a, b) => a.data.distance - b.data.distance)
        }

        if (!searchQuery.trim()) return []

        const query = searchQuery.toLowerCase()
        let results = businesses
            .filter(b =>
                b.name?.toLowerCase().includes(query) ||
                b.category?.toLowerCase().includes(query) ||
                b.description?.toLowerCase().includes(query)
            )
            .map(b => ({ type: 'business', data: b }))

        if (nearbyFilter && userCoords) {
            results = results.filter(r =>
                r.type === 'business' && r.data.distance !== undefined
                    ? r.data.distance <= 3
                    : true
            )
        }

        if (userCoords) {
            results.sort((a, b) => {
                const distA = a.data.distance || Infinity
                const distB = b.data.distance || Infinity
                return distA - distB
            })
        }

        return results.slice(0, 10)
    }, [searchQuery, nearbyFilter, businesses, userCoords])

    const searchResults = getSearchResults

    const handleSelectResult = useCallback(result => {
        if (result.type === 'business') {
            router.push(`/business-profile?id=${result.data.id || result.data._id}`)
        }
    }, [router])

    const handleQuickSearch = useCallback(query => {
        setSearchQuery(query)
    }, [])

    const toggleNearbyFilter = useCallback(() => {
        if (userCoords) {
            setNearbyFilter(prev => !prev)
        }
    }, [userCoords])

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" backgroundColor="#FFF" />

            <SearchInput
                searchQuery={searchQuery}
                onChangeText={setSearchQuery}
                onClear={() => setSearchQuery('')}
                onClose={() => router.back()}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#9B59B6']}
                        tintColor="#9B59B6"
                        progressBackgroundColor="#FFFFFF"
                    />
                }
            >
                {loading ? (
                    <LoadingState variant="list" count={5} />
                ) : searchQuery.trim().length > 0 || nearbyFilter ? (
                    <SearchResults
                        results={searchResults}
                        onSelectResult={handleSelectResult}
                        nearbyFilter={nearbyFilter}
                        userCoords={userCoords}
                    />
                ) : (
                    <>
                        <RecentSearches onSelectSearch={setSearchQuery} />
                        <SearchFilters
                            onQuickSearch={handleQuickSearch}
                            nearbyFilter={nearbyFilter}
                            onToggleNearby={toggleNearbyFilter}
                            userCoords={userCoords}
                        />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingBottom: spacing.xl,
    },
})
